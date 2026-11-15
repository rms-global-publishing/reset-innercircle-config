import {verifyKey} from 'discord-interactions';
import {waitUntil} from '@vercel/functions';
import {buildCommandResponse} from '../src/commands.js';
import {buildMembershipCommandResponse} from '../src/membership.js';
import {ASSISTANCE_COMMANDS,handleAssistance,assistanceFailure,isOperator} from '../src/assistance.js';
import {engineerMode,engineerUsesAssistance} from '../src/engineer.js';
import {isSoundcheckControl,soundcheckIdentity,verifySoundChoice,soundcheckEcho,soundcheckUnavailable} from '../src/soundcheck.js';
import {shouldDeferAudio,editDiscordDeferred} from '../src/discord-deferred.js';

const PING=1,APPLICATION_COMMAND=2,CHANNEL_MESSAGE_WITH_SOURCE=4,DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE=5,EPHEMERAL_FLAG=64;
async function readRawBody(req){
 const chunks=[];let size=0;
 for await(const part of req){const chunk=Buffer.from(part);size+=chunk.length;if(size>65536)throw Error('body_limit');chunks.push(chunk);}
 return Buffer.concat(chunks).toString('utf8');
}
function sendJson(res,status,payload){
 res.statusCode=status;
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('Cache-Control','no-store');
 res.end(JSON.stringify(payload));
}
function delayedError(name){console.warn('rms.soundcheck.'+name);}
export function createHandler({schedule=waitUntil,edit=editDiscordDeferred}={}){
 return async function handler(req,res){
  if(req.method==='GET')return sendJson(res,200,{ok:true,service:'RMS CreatorHub Discord Bridge',mode:'discord-http-interactions',assistance:'requested_interactions',unsolicited:'shadow',audio_reception:'listener_report_only'});
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return sendJson(res,405,{error:'Method not allowed'});}
  const publicKey=process.env.DISCORD_PUBLIC_KEY;
  if(!publicKey)return sendJson(res,503,{error:'Discord verification unavailable'});
  const signature=req.headers['x-signature-ed25519'],timestamp=req.headers['x-signature-timestamp'];
  if(typeof signature!=='string'||typeof timestamp!=='string'||!/^\d{10,11}$/.test(timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>300)return sendJson(res,401,{error:'Missing, stale or invalid Discord signature headers.'});
  let rawBody;
  try{rawBody=await readRawBody(req);}catch{return sendJson(res,413,{error:'Request too large'});}
  let valid=false;
  try{valid=await verifyKey(rawBody,signature,timestamp,publicKey);}catch{}
  if(!valid)return sendJson(res,401,{error:'Invalid request signature.'});
  let interaction;
  try{interaction=JSON.parse(rawBody);}catch{return sendJson(res,400,{error:'Invalid JSON payload.'});}
  if(interaction.type===PING)return sendJson(res,200,{type:PING});
  const guildId=process.env.DISCORD_GUILD_ID;
  if(!guildId){console.error('DISCORD_GUILD_ID is not configured.');return sendJson(res,503,{error:'Discord guild verification is not configured.'});}
  if(interaction.guild_id !== guildId || (process.env.DISCORD_CLIENT_ID && interaction.application_id!==process.env.DISCORD_CLIENT_ID))
   return sendJson(res,200,{type:CHANNEL_MESSAGE_WITH_SOURCE,data:{content:'This RMS command is available only inside Reset Inner Circle.',flags:EPHEMERAL_FLAG,allowed_mentions:{parse:[]}}});

  const commandName=interaction.data?.name;
  const mode=engineerMode(interaction);
  const deferred=shouldDeferAudio(interaction,commandName,mode);
  const delegated=ASSISTANCE_COMMANDS.has(commandName)&&
     commandName!=='soundcheck'&&commandName!=='helpstudio'&&
     (commandName!=='engineer'||engineerUsesAssistance(commandName,mode));

  if(commandName==='engineer'&&mode==='readiness'&&!isOperator(interaction))
   return sendJson(res,200,{type:CHANNEL_MESSAGE_WITH_SOURCE,data:{content:'Host readiness is for authorized Studio staff only. Use /soundcheck for private member assistance.',flags:EPHEMERAL_FLAG,allowed_mentions:{parse:[]}}});

  if(isSoundcheckControl(interaction)){
   try{
    const choice=verifySoundChoice(interaction.data.custom_id,soundcheckIdentity(interaction));
    if(choice==='echo')return sendJson(res,200,soundcheckEcho());
   }catch{
    return sendJson(res,200,{type:4,data:{content:'This private audio check expired or belongs to a different member. Run /soundcheck again for new controls.',flags:EPHEMERAL_FLAG,allowed_mentions:{parse:[]}}});
   }
  }

  if(deferred){
   // Discord requires acknowledgement in three seconds. This member-bound
   // transition may use two sequential RPCs and exceed a cold-start budget.
   const job=(async()=>{
    let reply;
    try{reply=await handleAssistance(interaction);}catch(error){
     delayedError(error?.name||'backend_unavailable');
     reply=soundcheckUnavailable();
    }
    try{await edit(interaction,reply);}catch(error){delayedError(error?.name||'edit_failed');}
   })();
   try{schedule(job);}catch{
    delayedError('schedule_unavailable');
    return sendJson(res,200,soundcheckUnavailable());
   }
   return sendJson(res,200,{type:DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,data:{flags:EPHEMERAL_FLAG}});
  }
  if(delegated||([3,5].includes(interaction.type)&&String(interaction.data?.custom_id||'').startsWith('ra1.'))){
   try{return sendJson(res,200,await handleAssistance(interaction));}
   catch(error){console.warn('rms.assistance.unavailable',error?.name||'Error');return sendJson(res,200,assistanceFailure());}
  }
  if(interaction.type!==APPLICATION_COMMAND)
   return sendJson(res,200,{type:CHANNEL_MESSAGE_WITH_SOURCE,data:{content:'This RMS GP interaction is not supported. Open /helpstudio for current controls.',flags:EPHEMERAL_FLAG,allowed_mentions:{parse:[]}}});
  try{
   const response=commandName==='membership'
    ?buildMembershipCommandResponse(interaction.member?.user?.id||interaction.user?.id||'',interaction.member?.roles||[])
    :buildCommandResponse(commandName,interaction);
   const data={allowed_mentions:{parse:[]}};
   if(response.content)data.content=response.content;
   if(response.embeds)data.embeds=response.embeds;
   if(response.components)data.components=response.components;
   if(response.ephemeral)data.flags=EPHEMERAL_FLAG;
   return sendJson(res,200,{type:CHANNEL_MESSAGE_WITH_SOURCE,data});
  }catch(error){
   console.warn('rms.discord.command_failure',error?.name||'Error');
   return sendJson(res,200,assistanceFailure());
  }
 };
}
export default createHandler();
