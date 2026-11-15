import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {generateKeyPairSync,sign} from 'node:crypto';
import {soundcheckMenu,soundcheckIdentity,signSoundChoice,verifySoundChoice} from '../src/soundcheck.js';
import {editDiscordDeferred} from '../src/discord-deferred.js';
import {createHandler} from '../api/interactions.js';

const base={id:'1550000000000000001',type:2,application_id:'1540169303213609023',token:'temporary-test-token-long-enough-not-a-real-secret',guild_id:'1429398855681573038',channel_id:'1429398859020370100',member:{user:{id:'111111111111111111'},permissions:'0'}};
const secret='test-secret-not-real';
function buttonFor(i,label){
 const resp=soundcheckMenu(i,{secret});
 const btn=resp.data.components[0].components.find(x=>x.label===label);
 assert.ok(btn);return btn.custom_id;
}
test('member Soundcheck has four clear action choices, independent of network',()=>{
 const r=soundcheckMenu(base,{secret});
 assert.equal(r.type,4);assert.equal(r.data.flags,64);
 assert.deepEqual(r.data.allowed_mentions.parse,[]);
 assert.equal(r.data.components[0].components.length,4);
 assert.match(r.data.embeds[0].description,/not|cannot|measure|actually hear/i);
 assert.match(r.data.embeds[0].description,/Game Room/);
 assert.match(r.data.embeds[0].description,/Cloud Studio XR/);
});
test('a soundcheck report cannot be replayed by another member, channel or after 10 min',()=>{
 const who=soundcheckIdentity(base),now=1794707400000;
 const token=signSoundChoice('silent',who,secret,now);
 assert.equal(verifySoundChoice(token,who,secret,now),'silent');
 assert.throws(()=>verifySoundChoice(token,{...who,member:'222222222222222222'},secret,now),/different member/);
 assert.throws(()=>verifySoundChoice(token,{...who,channel:'143000000000000000'},secret,now),/signature/);
 assert.throws(()=>verifySoundChoice(token,who,secret,now+601000),/expired/);
 assert.throws(()=>verifySoundChoice(token.slice(0,-2)+'aa',who,secret,now),/signature/);
 assert.throws(()=>signSoundChoice('unsafe_admin',who,secret,now),/generated/);
});
test('Discord deferred editor sends only a private edited message and never logs token',async()=>{
 const replies=[];
 const edited=await editDiscordDeferred(base,{type:4,data:{flags:64,content:'Private result',allowed_mentions:{parse:['everyone']}}},async(url,args)=>{
  replies.push({url,args});
  return {ok:true,status:200};
 });
 assert.equal(edited.ok,true);
 assert.match(replies[0].url,/\/webhooks\/1540169303213609023\//);
 const payload=JSON.parse(replies[0].args.body);
 assert.equal(payload.content,'Private result');
 assert.deepEqual(payload.allowed_mentions.parse,[]);
 assert.equal(Object.hasOwn(payload,'flags'),false);
});

test('signed live handler replies quickly and completes a private listener report via deferred edit',async()=>{
 const key=generateKeyPairSync('ed25519');
 const old={...process.env},beforeFetch=globalThis.fetch;
 process.env.DISCORD_PUBLIC_KEY=key.publicKey.export({format:'der',type:'spki'}).subarray(-32).toString('hex');
 process.env.DISCORD_GUILD_ID=base.guild_id;
 process.env.DISCORD_CLIENT_ID=base.application_id;
 process.env.RMS_MEMBERSHIP_SIGNING_SECRET=secret;
 process.env.RMS_CREATORHUB_SUPABASE_URL='https://fixture.supabase.co';
 const jobs=[],edits=[],calls=[];
 const handler=createHandler({schedule:p=>{jobs.push(p)},edit:async (i,reply)=>{edits.push({i,reply})}});
 const state={version:2,handler:'automation',paused:false,audio:'unconfirmed',audio_attempts:0,intents:['audio']};
 globalThis.fetch=async (url,opts)=>{calls.push(JSON.parse(opts.body));return Response.json({ok:true,decision:'audio_help',state,session_readiness:{route:'voice_mix'}})};
 async function send(i){
  const body=JSON.stringify(i),timestamp=String(Math.floor(Date.now()/1000));
  const req=Readable.from([body]);req.method='POST';req.headers={
    'x-signature-timestamp':timestamp,
    'x-signature-ed25519':sign(null,Buffer.from(timestamp+body),key.privateKey).toString('hex')};
  let reply;const res={statusCode:200,setHeader(){},end(b){reply=JSON.parse(b)}};
  await handler(req,res);return reply;
 }
 try{
  const initial=await send({...base,data:{name:'soundcheck'}});
  assert.equal(initial.type,4);
  assert.equal(initial.data.flags,64);
  assert.equal(calls.length,0);
  const token=initial.data.components[0].components[1].custom_id;
  const selected={...base,type:3,id:'1550000000000000003',data:{custom_id:token}};
  const ack=await send(selected);
  assert.equal(ack.type,5);assert.equal(ack.data.flags,64);
  await Promise.all(jobs);
  assert.equal(calls.length,2);
  assert.equal(calls[0].action,'audio');
  assert.equal(calls[0].facts.symptom,'music_only');
  assert.equal(calls[0].member,base.member.user.id);
  assert.equal(edits.length,1);
  assert.match(edits[0].reply.data.embeds[0].description,/host|voice|music/i);
  const invalid=await send({...selected,id:'1550000000000000004',member:{user:{id:'222222222222222222'},permissions:'0'}});
  assert.equal(invalid.type,4);
  assert.match(invalid.data.content,/different member|expired/);
  assert.equal(calls.length,2);
  const echo=await send({...selected,id:'1550000000000000005',data:{custom_id:initial.data.components[0].components[3].custom_id}});
  assert.equal(echo.type,4);
  assert.match(echo.data.embeds[0].title,/Echo/);
  assert.equal(calls.length,2);
  globalThis.fetch=async()=>new Response('{}',{status:503});
  jobs.length=0;edits.length=0;
  const failure=await send({...selected,id:'1550000000000000006'});
  assert.equal(failure.type,5);
  await Promise.all(jobs);
  assert.equal(edits.length,1);
  assert.match(edits[0].reply.data.embeds[0].title,/Report not saved/);
 }finally{
  globalThis.fetch=beforeFetch;
  for(const k of Object.keys(process.env))if(!(k in old))delete process.env[k];
  Object.assign(process.env,old);
 }
});
