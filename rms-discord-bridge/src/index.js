import http from 'node:http';
import {
  Client,
  Events,
  GatewayIntentBits,
} from 'discord.js';
import { buildCommandResponse } from './commands.js';
import {buildMembershipCommandResponse} from './membership.js';
import {ASSISTANCE_COMMANDS,handleAssistance,assistanceFailure} from './assistance.js';
import {engineerMode,engineerUsesAssistance} from './engineer.js';
import {isSoundcheckControl,soundcheckIdentity,verifySoundChoice,soundcheckEcho,soundcheckUnavailable} from './soundcheck.js';

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;
const alertsChannelId = process.env.AUTOMATION_ALERTS_CHANNEL_ID;
const port = Number(process.env.PORT || 3000);

if (!token || !guildId) {
  console.error('Missing DISCORD_TOKEN or DISCORD_GUILD_ID.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function sendPrivateOperationalAlert(message) {
  if (!alertsChannelId) return;
  try {
    const channel = await client.channels.fetch(alertsChannelId);
    if (channel?.isTextBased()) {
      await channel.send({
        content: `RMS automation alert: ${String(message).slice(0, 1500)}`,
        allowedMentions: { parse: [] },
      });
    }
  } catch (error) {
    console.error('Unable to deliver automation alert:', error?.message || error);
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`RMS CreatorHub Discord bridge ready as ${readyClient.user.tag}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isModalSubmit()) return;
  if (interaction.guildId !== guildId) {
    await interaction.reply({ content: 'This RMS command is available only inside Reset Inner Circle.', ephemeral: true });
    return;
  }

  try {
    const mode=engineerMode(interaction);
    const delegated=ASSISTANCE_COMMANDS.has(interaction.commandName)&&interaction.commandName!=='soundcheck'&&interaction.commandName!=='helpstudio'&&(interaction.commandName!=='engineer'||engineerUsesAssistance(interaction.commandName,mode));
    const quick=interaction.isChatInputCommand()&&(interaction.commandName==='soundcheck'||(interaction.commandName==='engineer'&&mode==='soundcheck'));
    const envelope=()=>({id:interaction.id,type:interaction.isChatInputCommand()?2:interaction.isModalSubmit()?5:3,guild_id:interaction.guildId,channel_id:interaction.channelId,member:{user:{id:interaction.user.id},permissions:interaction.memberPermissions?.bitfield?.toString()||'0'},data:{name:interaction.commandName,custom_id:interaction.customId,options:interaction.isChatInputCommand()?interaction.options?.data||[]:[],components:interaction.isModalSubmit()?[{components:[...interaction.fields.fields.values()].map(f=>({custom_id:f.customId,value:f.value}))}]:[]}});
    if(quick){await interaction.reply({...buildCommandResponse(interaction.commandName,envelope()),allowedMentions:{parse:[]}});return;}
    if(interaction.isButton()&&isSoundcheckControl(envelope())){
     let choice;
     try{choice=verifySoundChoice(interaction.customId,soundcheckIdentity(envelope()));}catch{await interaction.reply({content:'This soundcheck control expired. Run /soundcheck again.',ephemeral:true});return;}
     if(choice==='echo'){const {flags,...data}=soundcheckEcho().data;await interaction.reply({...data,ephemeral:true,allowedMentions:{parse:[]}});return;}
     await interaction.deferReply({flags:64});
     let answer;try{answer=await handleAssistance(envelope());}catch{answer=soundcheckUnavailable();}
     const {flags,...data}=answer.data;
     await interaction.editReply({...data,allowedMentions:{parse:[]}});return;
    }
    if(interaction.isChatInputCommand()&&interaction.commandName==='engineer'&&mode==='readiness'&&!((interaction.memberPermissions?.bitfield||0n)&56n)){
      await interaction.reply({content:'Host readiness is for authorized Studio staff only. Use /soundcheck for member help.',ephemeral:true});return;
    }
    if(delegated||String(interaction.customId||'').startsWith('ra1.')){
      const form=interaction.isModalSubmit()?[{components:[...interaction.fields.fields.values()].map(field=>({custom_id:field.customId,value:field.value}))}]:[];
      const envelope={id:interaction.id,type:interaction.isChatInputCommand()?2:interaction.isModalSubmit()?5:3,guild_id:interaction.guildId,channel_id:interaction.channelId,member:{user:{id:interaction.user.id},permissions:interaction.memberPermissions?.bitfield.toString()||'0'},data:{name:interaction.commandName,custom_id:interaction.customId,options:interaction.isChatInputCommand()?interaction.options?.data||[]:[],components:form}};
      const useDefer=interaction.isChatInputCommand()&&interaction.commandName==='engineer'&&['music','silent','readiness'].includes(mode);
      if(useDefer)await interaction.deferReply({flags:64});
      let answer;try{answer=await handleAssistance(envelope);}catch{answer=useDefer?soundcheckUnavailable():assistanceFailure();}
      if(answer?.type===9){await interaction.showModal(answer.data);return;}
      if(answer?.data){const {allowed_mentions,...data}=answer.data;if(useDefer)await interaction.editReply({...data,allowedMentions:{parse:[]}});else await interaction.reply({...data,allowedMentions:{parse:[]}});return;}
    }
    if(!interaction.isChatInputCommand()){await interaction.reply({content:'Open /helpstudio for current controls.',flags:64});return;}
    const response = interaction.commandName==='membership'?buildMembershipCommandResponse(interaction.user.id):buildCommandResponse(interaction.commandName,interaction);
    await interaction.reply({
      ...response,
      allowedMentions: { parse: [] },
    });
  } catch (error) {
    console.error(`Command ${interaction.commandName} failed:`, error?.message || error);
    await sendPrivateOperationalAlert(`Command /${interaction.commandName} failed.`);
    const failure = { content: 'That RMS command could not complete. Please use the support route while the automation is checked.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(failure).catch(() => undefined);
    } else {
      await interaction.reply(failure).catch(() => undefined);
    }
  }
});

client.on(Events.Error, async (error) => {
  console.error('Discord client error:', error?.message || error);
  await sendPrivateOperationalAlert('Discord client error detected. Manual RMS fallback remains available.');
});

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    const ready = client.isReady();
    res.writeHead(ready ? 200 : 503, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      service: 'rms-discord-bridge',
      status: ready ? 'ready' : 'starting',
      guild: guildId,
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found' }));
});

server.listen(port, () => {
  console.log(`Health endpoint listening on port ${port}.`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}; shutting down RMS Discord bridge.`);
  server.close();
  client.destroy();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

client.login(token).catch(async (error) => {
  console.error('Discord login failed:', error?.message || error);
  await sendPrivateOperationalAlert('Discord login failed.');
  process.exit(1);
});
