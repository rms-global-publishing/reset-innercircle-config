// Angelea McCullough, Founder of RMS Global Publishing.
// Requested help only. No message-content listener, unsolicited posts, payments or rights writes.
import {createHmac,timingSafeEqual} from 'node:crypto';
const HOME='https://creators.rmsglobalpublishing.com';
export const ASSISTANCE_COMMANDS=new Set(['portal','helpstudio','support','requestmix','studioservices','rights','sync','licensing','studio']);
export const ACTIONS=new Set(['open','audio','music_only','all_silent','audio_retry','audio_confirm','audio_defer','publishing','scope','catalog','licensing','production','share','pause','resume','preflight','route_voice','route_stream','route_unknown','host_checks','audience_verified','route_changed','session_end','takeover','release']);
const STAFF=new Set(['preflight','route_voice','route_stream','route_unknown','host_checks','audience_verified','route_changed','session_end','takeover','release']);
const SESSION=new Set(['preflight','route_voice','route_stream','route_unknown','host_checks','audience_verified','route_changed','session_end']);
const idOK=x=>typeof x==='string'&&/^\d{15,22}$/.test(x);
export function isOperator(interaction){try{return (BigInt(interaction.member?.permissions||'0')&56n)!==0n;}catch{return false;}}
function identity(i){const member=i.member?.user?.id; if(!idOK(member)||!idOK(i.guild_id)||!idOK(i.channel_id))throw Error('Invalid interaction identity');return {member,guild:i.guild_id,channel:i.channel_id};}
export function signAction(action,subject,version,identityValue,secret,now=Date.now()){
 if(!ACTIONS.has(action)||!idOK(subject)||!Number.isSafeInteger(version)||version<0||!secret)throw Error('Invalid action');
 const prefix=['ra1',action,subject,version.toString(36),Math.floor(now/1000+900).toString(36)].join('.');
 const tag=createHmac('sha256',secret).update('RMS-ASSISTANCE-V1|'+prefix+'|'+identityValue.guild+'|'+identityValue.channel+'|'+identityValue.member).digest('base64url').slice(0,18);
 const token=prefix+'.'+tag;if(token.length>100)throw Error('Action too long');return token;
}
export function verifyAction(token,who,secret,now=Date.now()){
 if(typeof token!=='string'||token.length>100||!secret)throw Error('Invalid action');const parts=token.split('.');if(parts.length!==6||parts[0]!=='ra1'||!ACTIONS.has(parts[1])||!idOK(parts[2])||!/^[0-9a-z]+$/.test(parts[3])||!/^[0-9a-z]+$/.test(parts[4]))throw Error('Invalid action');
 const expiry=parseInt(parts[4],36),version=parseInt(parts[3],36);if(!Number.isSafeInteger(version)||version<0||expiry<now/1000||expiry>now/1000+901)throw Error('This control expired. Open /helpstudio again.');
 const tag=createHmac('sha256',secret).update('RMS-ASSISTANCE-V1|'+parts.slice(0,5).join('.')+'|'+who.guild+'|'+who.channel+'|'+who.member).digest('base64url').slice(0,18);const a=Buffer.from(tag),b=Buffer.from(parts[5]);if(a.length!==b.length||!timingSafeEqual(a,b))throw Error('This control belongs to a different member or session.');return {action:parts[1],subject:parts[2],version};
}
export function classifyIntent(text){
 const t=String(text).slice(0,1500).toLowerCase();const intents=[];
 if(/(?:can.?t|cannot|can not|no|missing).{0,20}(?:hear|here|music|audio|sound)|(?:music|audio|sound).{0,20}(?:silent|not working)/.test(t))intents.push('audio');
 if(/publish|royalt|licens/.test(t))intents.push('publishing');
 const count=/\b(\d{1,3})\s*[- ]?\s*(?:songs?|tracks?)\b/.exec(t);if(count||/cost|mix(?:ture|tape)|price/.test(t))intents.push('scope');
 if(/check out|feedback|my (?:site|website)|prelaunch/.test(t))intents.push('share');
 if(/back to work|later|got to go|have to go/.test(t))intents.push('pause');
 return {intents, ...(count&&+count[1]>0&&+count[1]<=500?{track_count:+count[1]}:{})};
}
export function helpCopy(result){
 const s=result.state||{},count=s.track_count?`Your ${s.track_count}-track project: `:'';
 if(result.code==='STATE_CHANGED')return ['Your help state changed','Someone handled this or you used another control. The latest saved state is shown; no duplicate action was applied.'];
 if(result.duplicate)return ['Already recorded','That exact interaction was already handled. These controls use the current saved state.'];
 if(s.handler==='human')return ['A human is handling this','Rowan has stepped back. Your unresolved needs stay recorded; no duplicate pitch or reminder will be sent.'];
 if(s.paused)return ['Take your time','Your place is saved. No reminder or direct message is scheduled. Resume only when you are ready.'];
 switch(result.decision){
 case 'audio_help':case 'host_escalation_required':{
  const route=result.session_readiness?.route||'unknown';const setup=route==='go_live'?'The host configured stream audio. Open the intended RMS GP host stream, not an unrelated game stream, and check that stream\'s mute and volume.':route==='voice_mix'?'The host configured music through the voice mix. Check the intended host\'s user volume and whether you hear voices. The host should check the music send; opening a camera tile does not restore audio.':'The host has not confirmed the delivery method. Are voices audible but music missing, or is everything silent? Do not switch to an unrelated stream.';
  return [result.decision==='host_escalation_required'?'Host assistance needed':'Let\'s check the sound',setup+'\n\n'+(result.decision==='host_escalation_required'?'Two guided attempts are recorded. The private host dashboard flags this for attention. Use the support route for direct assistance; no host notification is claimed.':'Choose what you hear below. Only your confirmation marks your listening issue resolved.')+(s.intents?.includes('publishing')?'\n\nYour publishing question is saved for after the audio check.':'')];}
 case 'publishing_explained':return ['Music publishing, clearly','The song (music and lyrics) and the sound recording are separate works. Catalog intake organizes your records; representation, royalty administration and licensing require their own verified scope and agreements. Uploading does not transfer ownership or guarantee marketplace admission or placements.\n\nBase intake is free. Optional professional work has a defined price before checkout. '+count+'choose the outcome below.'];
 case 'clarify_service':return ['Which outcome do you need?',count+'Are these finished tracks to catalog, music needing publishing/licensing guidance, or audio to mix and master? A track count alone is not enough for a reliable production quote.'];
 case 'route_catalog':return ['Start with your existing work',count+'Base private catalog intake is free. Each track keeps its own rights and metadata record. Marketplace admission, license terms, transaction terms and optional services are separate decisions.'];
 case 'route_licensing':return ['Publishing and licensing guidance',count+'Confirm the composition and recording ownership, co-creators and any samples, covers or leased beats through the secure workflow. A readiness service does not buy a guaranteed placement.'];
 case 'route_production':return ['Define the production scope first',count+'Review the approved service menu, then specify mixes versus multitracks, duration, deliverables and revisions. No automatic bundle, payment or per-track multiplication is created.'];
 case 'peer_feedback_not_endorsement':return ['Creators discovering creators','Share your public portfolio in the relevant designated showcase channel. A feedback request is not a partnership, endorsement or license. Use private Support to request an RMS review; this control does not claim a website was reviewed or save the URL.'];
 case 'audience_check_required':return ['Verify the room before calling it ready','Set the actual audio route. Confirm host voice, music send, mix-minus/no doubling and recording disclosure, then confirm reception with a remote listener on that same route. Device or stream changes invalidate the check.'];
 case 'host_attested_ready':return ['Current-route audience test recorded','A host explicitly confirmed the checklist and remote listener reception within the last 30 minutes. This is a host attestation, not an automated measurement or a claim that every listener hears audio.'];
 default:return ['Welcome to Reset Inner Circle','Listen to the room, share your work, or explore music publishing and costs. One useful next step at a time. Your choice does not create a purchase, license, representation agreement or unsolicited reminder.'];
 }
}
function callback(title,description,components=[]){return {type:4,data:{flags:64,allowed_mentions:{parse:[]},embeds:[{color:0xc8a24a,title,description,footer:{text:'RMS Global Publishing | Ownership first | Rowan assistance'}}],components}};}
function modal(custom_id,title,label,id,placeholder,max=3){return {type:9,data:{custom_id,title,components:[{type:1,components:[{type:4,custom_id:id,label,style:1,required:true,min_length:1,max_length:max,placeholder}]}]}};}
function inputValue(i,key){for(const row of i.data?.components||[])for(const c of row.components||[])if(c.custom_id===key)return String(c.value||'');return '';}
function actionMenu(r,i,secret,session=false){
 const who=identity(i),s=r.state||{},version=Number(s.version||0);
 const button=(label,action)=>({type:2,style:2,label,custom_id:signAction(action,SESSION.has(action)?who.channel:who.member,version,who,secret)});
 const row=(...buttons)=>({type:1,components:buttons});
 if(session)return [row(button('Music via voice mix','route_voice'),button('Music via Go Live','route_stream'),button('Route changed','route_changed')),row(button('Host checklist confirmed','host_checks'),button('Listener confirmed','audience_verified'),button('Check readiness','preflight')),row(button('End session','session_end'),button('Member help','open'))];
 if(s.handler==='human')return [row({type:2,style:5,label:'Private support',url:HOME+'/creator/support'})];
 if(s.paused)return [row(button('Resume my help','resume'))];
 const rows=[];
 if(s.audio==='unconfirmed'&&!s.audio_deferred)rows.push(row(button('Voices only; no music','music_only'),button('Everything silent','all_silent'),button('Still not hearing it','audio_retry'),button('I hear it now','audio_confirm')));
 if(s.audio==='unconfirmed'&&!s.audio_deferred)rows.push(row(button('Continue other help; audio unresolved','audio_defer')));
 else rows.push(row(button('Audio help','audio'),button('Publishing explained','publishing'),button('Project costs','scope'),button('Share my work','share')));
 if(['clarify_service','publishing_explained','route_catalog','route_licensing','route_production'].includes(r.decision))rows.push(row(button('Catalog finished tracks','catalog'),button('Publishing / licensing','licensing'),button('Mix / master','production')));
 rows.push(row(button('Pause; back later','pause'),{type:2,style:5,label:r.decision==='route_production'?'View service scope':'Start in CreatorHub',url:HOME+(r.route||'/start')},{type:2,style:5,label:'Private support',url:HOME+'/creator/support'}));
 if(isOperator(i))rows.push(row(button('Host audio readiness','preflight'),button('Handled by human','takeover'),button('Return to Rowan','release')));
 return rows;
}
export async function handleAssistance(i,{gateway,secret=process.env.RMS_MEMBERSHIP_SIGNING_SECRET,now=Date.now()}={}){
 const who=identity(i),op=isOperator(i),signal=AbortSignal.timeout(1900);
 const call=gateway||((event)=>assistanceGateway(event,signal));
 let action='open',expected=null,subject=who.member,facts={},session=false;
 if(i.type===2){const name=i.data?.name;if(!ASSISTANCE_COMMANDS.has(name))return null;action=['sync','licensing','rights'].includes(name)?'publishing':['requestmix','studioservices'].includes(name)?'scope':'open';}
 else if([3,5].includes(i.type)){const control=verifyAction(i.data?.custom_id,who,secret,now);({action,subject}=control);expected=control.version;if(STAFF.has(action)&&!op)throw Error('Staff authority is required for that action.');session=SESSION.has(action);if(subject!==(session?who.channel:who.member))throw Error('Different member or room.');
  if(i.type===3&&action==='scope')return modal(signAction('scope',who.member,expected,who,secret,now),'Tell us about your collection','How many tracks? (1-500)','track_count','14');
  if(i.type===3&&['takeover','release'].includes(action))return modal(signAction(action,who.member,expected,who,secret,now),action==='takeover'?'Handle a member inquiry':'Return an inquiry to Rowan','Discord member ID (not their display name)','member_id','Member ID',22);
  if(i.type===5&&action==='scope'){const raw=inputValue(i,'track_count');if(!/^\d{1,3}$/.test(raw)||+raw<1||+raw>500)throw Error('Use a whole track count from 1 to 500.');facts.track_count=+raw;}
  else if(i.type===5&&['takeover','release'].includes(action)){const target=inputValue(i,'member_id');if(!op||!idOK(target))throw Error('A valid member ID and staff authority are required.');subject=target;expected=null;}
  else if(i.type===5)throw Error('Unsupported form.');
 }else return null;
 if(['music_only','all_silent'].includes(action)){facts.symptom=action;action='audio';}
 if(action==='preflight')expected=null;
 if(['host_checks','audience_verified'].includes(action)){facts.confirmed=true;const current=await call({...who,session:true,context:'studio',event_id:i.id,action:'read',operator:op});if(current.state?.version!==expected){const stale={...current,code:'STATE_CHANGED'};return callback(...helpCopy(stale),actionMenu(stale,i,secret,true));}facts.route_revision=current.state?.route_revision;}
 if(action==='audio_confirm')facts.confirmed=true;if(action==='publishing')facts.work_kind='music';
 const event={...who,member:subject,context:session?'studio':'community',event_id:i.id,action,facts,expected,operator:op,session};
 // The identity and operator claims come only from a verified Discord envelope, never a form field.
 const r=await call(event);if(!r?.ok&&r?.code!=='STATE_CHANGED')throw Error('Help state is temporarily unavailable. No purchase or reminder was created.');
 if(['takeover','release'].includes(action))return callback(action==='takeover'?'Human handling recorded':'Human handling released','The targeted inquiry was updated. Unresolved audio and the member\'s own pause preference are preserved. No message was sent to that member.');
 // Recheck immediately before constructing the reply; a human claim/pause invalidates stale suggestions.
 const latest=await call({...event,action:'read',facts:{},expected:null});if(!latest?.ok)throw Error('Could not confirm current help state.');
 const changed=latest.state?.version!==r.state?.version;const current={...r,state:latest.state,session_readiness:latest.session_readiness,...(changed?{code:'STATE_CHANGED',route:'/creator/assistance'}:{})};const [title,copy]=helpCopy(current);return callback(session?'Sound Stage readiness':title,session?copy+'\n\nRoute: '+(latest.state?.route||'unknown')+'. Before confirming: check voice, music send, mix-minus/no doubling, recording disclosure and a remote listener. A confirmation applies only to the displayed saved route.':copy,actionMenu(current,i,secret,session));
}
export async function assistanceGateway(event,signal){
 const base=(process.env.RMS_CREATORHUB_SUPABASE_URL||'').replace(/\/$/,'');const secret=process.env.RMS_MEMBERSHIP_SIGNING_SECRET||'';
 if(!secret||!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(base))throw Error('Shared help is unavailable. Use /membership for membership or the CreatorHub support route.');
 const response=await fetch(base+'/functions/v1/rms-assistance-gateway',{method:'POST',headers:{'content-type':'application/json','x-rms-assistance-secret':secret},body:JSON.stringify(event),signal});
 if(!response.ok)throw Error('Could not confirm the saved help state. Open /helpstudio to retry. No paid action was submitted.');return response.json();
}
export function assistanceFailure(){return callback('Help could not be confirmed','Your work and existing access are unchanged. Open /helpstudio again to use the latest state. No paid action, direct message or reminder was created.',[{type:1,components:[{type:2,style:5,label:'Open private support',url:HOME+'/creator/support'}]}]);}
