import {verifyKey} from 'discord-interactions';
import {buildCommandResponse} from '../src/commands.js';
import {buildMembershipCommandResponse} from '../src/membership.js';
import {ASSISTANCE_COMMANDS,handleAssistance,assistanceFailure} from '../src/assistance.js';
const PING=1,APPLICATION_COMMAND=2,CHANNEL_MESSAGE_WITH_SOURCE=4,EPHEMERAL_FLAG=64;
async function readRawBody(req){const chunks=[];let size=0;for await(const part of req){const chunk=Buffer.from(part);size+=chunk.length;if(size>65536)throw Error('body_limit');chunks.push(chunk);}return Buffer.concat(chunks).toString('utf8');}
function sendJson(res,status,payload){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(payload));}
export default async function handler(req,res){
 if(req.method==='GET')return sendJson(res,200,{ok:true,service:'RMS CreatorHub Discord Bridge',mode:'discord-http-interactions',assistance:'requested_interactions',unsolicited:'shadow',audio_reception:'not_measured'});
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return sendJson(res,405,{error:'Method not allowed'});}
 const publicKey=process.env.DISCORD_PUBLIC_KEY;if(!publicKey)return sendJson(res,503,{error:'Discord verification unavailable'});
 const signature=req.headers['x-signature-ed25519'],timestamp=req.headers['x-signature-timestamp'];
 if(typeof signature!=='string'||typeof timestamp!=='string'||!/^\d{10,11}$/.test(timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>300)return sendJson(res,401,{error:'Missing, stale or invalid Discord signature headers.'});
 let rawBody;try{rawBody=await readRawBody(req);}catch{return sendJson(res,413,{error:'Request too large'});}
 let valid=false;try{valid=await verifyKey(rawBody,signature,timestamp,publicKey);}catch{}if(!valid)return sendJson(res,401,{error:'Invalid request signature.'});
 let interaction;try{interaction=JSON.parse(rawBody);}catch{return sendJson(res,400,{error:'Invalid JSON payload.'});}
 if(interaction.type===PING)return sendJson(res,200,{type:PING});
 const guildId=process.env.DISCORD_GUILD_ID;if(!guildId){console.error('DISCORD_GUILD_ID is not configured.');return sendJson(res,503,{error:'Discord guild verification is not configured.'});}
 if(interaction.guild_id !== guildId||(process.env.DISCORD_CLIENT_ID&&interaction.application_id!==process.env.DISCORD_CLIENT_ID))return sendJson(res,200,{type:CHANNEL_MESSAGE_WITH_SOURCE,data:{content:'This RMS command is available only inside Reset Inner Circle.',flags:EPHEMERAL_FLAG,allowed_mentions:{parse:[]}}});
 const commandName=interaction.data?.name;
 if(ASSISTANCE_COMMANDS.has(commandName)||([3,5].includes(interaction.type)&&String(interaction.data?.custom_id||'').startsWith('ra1.'))){
  try{return sendJson(res,200,await handleAssistance(interaction));}catch(error){console.warn('rms.assistance.unavailable',error?.name||'Error');return sendJson(res,200,assistanceFailure());}
 }
 if(interaction.type!==APPLICATION_COMMAND)return sendJson(res,200,{type:CHANNEL_MESSAGE_WITH_SOURCE,data:{content:'This RMS GP interaction is not supported. Open /helpstudio for current controls.',flags:EPHEMERAL_FLAG,allowed_mentions:{parse:[]}}});
 try{
  const commandResponse=commandName==='membership'?buildMembershipCommandResponse(interaction.member?.user?.id||interaction.user?.id||''):buildCommandResponse(commandName);
  const data={allowed_mentions:{parse:[]}};if(commandResponse.content)data.content=commandResponse.content;if(commandResponse.embeds)data.embeds=commandResponse.embeds;if(commandResponse.components)data.components=commandResponse.components;if(commandResponse.ephemeral)data.flags=EPHEMERAL_FLAG;
  return sendJson(res,200,{type:CHANNEL_MESSAGE_WITH_SOURCE,data});
 }catch{return sendJson(res,200,assistanceFailure());}
}
