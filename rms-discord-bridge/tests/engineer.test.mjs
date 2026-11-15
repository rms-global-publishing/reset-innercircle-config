import test from 'node:test';
import assert from 'node:assert/strict';
import {ENGINEER_OPTIONS,engineerMode,engineerUsesAssistance,engineerPublicResponse} from '../src/engineer.js';
import {commandData,buildCommandResponse} from '../src/commands.js';
import {handleAssistance} from '../src/assistance.js';
const base={id:'1550000000000000001',type:2,guild_id:'1429398855681573038',channel_id:'1468103128279941272',member:{user:{id:'111111111111111111'},permissions:'0'}};
const event=(name,mode,staff=false)=>({...base,member:{...base.member,permissions:staff?'32':'0'},data:{name,options:mode?[{name:'issue',type:3,value:mode}]:[]}});
const state={version:1,handler:'automation',paused:false,audio:'unknown',scope:'unknown',intents:[]};
const gateway=async()=>({ok:true,state,decision:'audio_help',session_readiness:{route:'unknown'}});
test('one discoverable command with ten safe choices, plus quick /soundcheck',()=>{
 const engineer=commandData.find(x=>x.name==='engineer');
 const quick=commandData.find(x=>x.name==='soundcheck');
 assert.ok(engineer);assert.ok(quick);
 assert.equal(engineer.options.length,1);
 assert.equal(engineer.options[0].required,false);
 assert.deepEqual(engineer.options[0].choices.map(x=>x.value),ENGINEER_OPTIONS.map(x=>x.value));
 assert.ok(commandData.some(x=>x.name==='studio'));assert.ok(commandData.some(x=>x.name==='helpstudio'));
 assert.equal(new Set(commandData.map(x=>x.name)).size,commandData.length);
});
test('engineering menu uses private member-safe instructions, existing Studio XR route and private support',()=>{
 for(const mode of ['menu','echo','video','recording','mpc']){
 const x=engineerPublicResponse(mode);
 assert.equal(x.ephemeral,true);
 assert.match(x.embeds[0].description,/1468103128279941272/);
 assert.ok(x.components[0].components.some(b=>b.url?.includes('/creator/support')));
 assert.equal(x.components[0].components.every(b=>b.style===5),true);
 assert.doesNotMatch(x.embeds[0].description,/token|password|secret/i);
 }
 assert.match(buildCommandResponse('engineer',event('engineer','video')).embeds[0].description,/Go Live/);
 assert.match(buildCommandResponse('engineer',event('engineer')).embeds[0].description,/soundcheck/);
});
test('only supported private modes enter existing assistance; other modes remain guidance',()=>{
 assert.equal(engineerMode(event('engineer','music')),'music');
 assert.equal(engineerMode(event('engineer','invalid')),'menu');
 assert.equal(engineerMode(event('engineer')),'menu');
 for(const mode of ['soundcheck','music','silent','readiness'])assert.equal(engineerUsesAssistance('engineer',mode),true);
 for(const mode of ['menu','echo','video','recording','mpc'])assert.equal(engineerUsesAssistance('engineer',mode),false);
 assert.equal(engineerUsesAssistance('soundcheck','menu'),true);
});
test('member audio symptoms are persisted through existing private gateway with actor binding',async()=>{
 for(const [name,mode,symptom] of [['soundcheck',undefined,undefined],['engineer','soundcheck',undefined],['engineer','music','music_only'],['engineer','silent','all_silent']]){
 const calls=[];
 const r=await handleAssistance(event(name,mode),{gateway:async x=>{calls.push(x);return gateway(x)},secret:'test-secret'});
 assert.equal(r.type,4);assert.equal(r.data.flags,64);assert.deepEqual(r.data.allowed_mentions.parse,[]);
 assert.equal(calls[0].action,'audio');
 assert.equal(calls[0].facts.symptom,symptom);
 assert.equal(calls[0].member,base.member.user.id);
 assert.equal(calls[0].session,false);
 assert.equal(calls.length,2);
 }
});
test('host readiness cannot be called by members; staff uses existing versioned studio route',async()=>{
 await assert.rejects(handleAssistance(event('engineer','readiness'),{gateway,secret:'test-secret'}),/Staff authority/);
 const calls=[];
 const r=await handleAssistance(event('engineer','readiness',true),{gateway:async x=>{calls.push(x);return {...await gateway(x),decision:'audience_check_required'}},secret:'test-secret'});
 assert.equal(r.type,4);assert.equal(r.data.flags,64);
 assert.equal(calls[0].action,'preflight');
 assert.equal(calls[0].session,true);
 assert.equal(calls[0].member,base.channel_id);
 assert.equal(calls[0].operator,true);
 assert.ok(r.data.components.flatMap(x=>x.components).some(b=>b.label==='Listener confirmed'));
});

import handler from '../api/interactions.js';
import {Readable} from 'node:stream';
import {generateKeyPairSync,sign} from 'node:crypto';
test('signed Discord gateway handles engineering menu, audio help and rejects unauthorized staff check',async()=>{
 const key=generateKeyPairSync('ed25519');
 const old={...process.env};
 const orig=globalThis.fetch;
 process.env.DISCORD_PUBLIC_KEY=key.publicKey.export({format:'der',type:'spki'}).subarray(-32).toString('hex');
 process.env.DISCORD_GUILD_ID=base.guild_id;
 process.env.DISCORD_CLIENT_ID='1540169303213609023';
 process.env.RMS_MEMBERSHIP_SIGNING_SECRET='test-secret';
 process.env.RMS_CREATORHUB_SUPABASE_URL='https://fixture.supabase.co';
 let forwarded=0;
 globalThis.fetch=async()=>{forwarded++;return Response.json({ok:true,state,decision:'audio_help',session_readiness:{route:'voice_mix'}})};
 const send=async payload=>{
  const body=JSON.stringify({...payload,application_id:process.env.DISCORD_CLIENT_ID});
  const timestamp=String(Math.floor(Date.now()/1000));
  const req=Readable.from([body]);req.method='POST';req.headers={
   'x-signature-timestamp':timestamp,
   'x-signature-ed25519':sign(null,Buffer.from(timestamp+body),key.privateKey).toString('hex'),
  };
  let response;
  const res={statusCode:200,setHeader(){},end(value){response=JSON.parse(value)}};
  await handler(req,res);return response;
 };
 try{
  const menu=await send(event('engineer','menu'));
  assert.equal(menu.type,4);
  assert.equal(menu.data.flags,64);
  assert.match(menu.data.embeds[0].description,/Cloud Studio XR/);
  assert.equal(forwarded,0);
  const staff=await send(event('engineer','readiness'));
  assert.equal(staff.data.flags,64);
  assert.match(staff.data.content,/authorized Studio staff only/);
  assert.equal(forwarded,0);
  const audio=await send(event('engineer','music'));
  assert.equal(audio.data.flags,64);
  assert.ok(audio.data.components.length>0);
  assert.equal(forwarded,2);
  const simple=await send(event('soundcheck'));
  assert.equal(simple.data.flags,64);
  assert.equal(forwarded,4);
 }finally{
  globalThis.fetch=orig;
  for(const k of Object.keys(process.env))if(!(k in old))delete process.env[k];
  Object.assign(process.env,old);
 }
});
