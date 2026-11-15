// RMS Global Publishing - Discord member-bound sound reception test.
// A report is a listener statement, not host-signal or audience-wide measurement.
import {createHmac,timingSafeEqual} from 'node:crypto';

const guild='1429398855681573038';
const studio='https://discord.com/channels/'+guild+'/1468103128279941272';
const game='https://discord.com/channels/'+guild+'/1429398859020370100';
const support='https://creators.rmsglobalpublishing.com/creator/support';
const choices=new Set(['heard','voice','silent','echo']);
const id=/^\d{15,22}$/;
const menu=(title,description,components=[])=>({type:4,data:{
 flags:64,allowed_mentions:{parse:[]},
 embeds:[{title,description,color:0xc8a24a,footer:{text:'RMS Global Publishing | Reset Inner Circle | Listener-controlled check'}}],
 components
}});
export function signSoundChoice(choice,who,secret=process.env.RMS_MEMBERSHIP_SIGNING_SECRET,now=Date.now()){
 if(!choices.has(choice)||!secret||!id.test(who?.member)||!id.test(who?.channel)||who?.guild!==guild)throw Error('Soundcheck control could not be generated');
 const prefix=['sc1',choice,who.member,Math.floor(now/1000+600).toString(36)].join('.');
 const mac=createHmac('sha256',secret).update(prefix+'|'+who.guild+'|'+who.channel).digest('base64url').slice(0,20);
 const token=prefix+'.'+mac;
 if(token.length>100)throw Error('Soundcheck control exceeds Discord limit');
 return token;
}
export function verifySoundChoice(token,who,secret=process.env.RMS_MEMBERSHIP_SIGNING_SECRET,now=Date.now()){
 if(typeof token!=='string'||token.length>100||!secret)throw Error('Invalid soundcheck control');
 const segments=token.split('.');
 if(segments.length!==5||segments[0]!=='sc1'||!choices.has(segments[1])||
 !id.test(segments[2])||segments[2]!==who?.member||who?.guild!==guild||!id.test(who?.channel)||
 !/^[0-9a-z]+$/.test(segments[3]))throw Error('Soundcheck control belongs to a different member');
 const expiry=parseInt(segments[3],36);
 if(!Number.isSafeInteger(expiry)||expiry<now/1000||expiry>now/1000+601)throw Error('Soundcheck control expired');
 const prefix=segments.slice(0,4).join('.');
 const mac=createHmac('sha256',secret).update(prefix+'|'+who.guild+'|'+who.channel).digest('base64url').slice(0,20);
 const a=Buffer.from(mac),b=Buffer.from(segments[4]||'');
 if(a.length!==b.length||!timingSafeEqual(a,b))throw Error('Soundcheck control signature invalid');
 return segments[1];
}
export function soundcheckIdentity(i){
 const member=i?.member?.user?.id||i?.user?.id;
 return {member,guild:i?.guild_id,channel:i?.channel_id};
}
export function isSoundcheckControl(i){
 return i?.type===3&&typeof i.data?.custom_id==='string'&&i.data.custom_id.startsWith('sc1.');
}
export function soundcheckMenu(i,{secret=process.env.RMS_MEMBERSHIP_SIGNING_SECRET,now=Date.now()}={}){
 const who=soundcheckIdentity(i);
 const controls=[
  ['I hear voice + music','heard',3],
  ['Voice, no music','voice',2],
  ['Everything silent','silent',4],
  ['Echo / distortion','echo',2]
 ];
 const buttons=controls.map(([label,choice,style])=>({type:2,style,label,custom_id:signSoundChoice(choice,who,secret,now)}));
 return menu('Soundcheck | What can YOU hear?',
 '**Step 1:** Join the host in <#1429398859020370100> (Game Room) or <#1468103128279941272> (Cloud Studio XR). If the host is using Go Live, open their stream and check its volume.\n\n**Step 2:** Listen briefly while the host speaks and plays approved music. Select the closest answer below.\n\n**Step 3:** Your reply is private. Reporting a problem records your listening issue when the assistance service confirms it; it does not change the host mixer or notify everyone.\n\n**Important:** Discord cannot measure your speakers through a slash command. The Sound Engineer separately measures the host audio bus, while this test records what you actually hear.\n\n**Your choices:** Voice + music | Voice only | Silent | Echo.',
 [{type:1,components:buttons},{type:1,components:[
  {type:2,style:5,label:'Game Room',url:game},
  {type:2,style:5,label:'Cloud Studio XR',url:studio},
  {type:2,style:5,label:'Private Support',url:support}
 ]}]);
}
export function soundcheckEcho(){
 return menu('Echo / distortion | Quick fix',
 'Use headphones, reduce speaker monitoring, and check that Discord return audio does not feed back into its own transmit bus. If the problem continues, tell the host which room and whether it affects voice, music or both. This reply does not change anyone\'s mixer or record an issue in the backend.',
 [{type:1,components:[{type:2,style:5,label:'Private Studio Support',url:support}]}]);
}
export function soundcheckUnavailable(){
 return menu('Soundcheck | Report not saved',
 'We could not confirm the current assistance record. **Your selection was not verified as saved.** You can still listen: check that you joined the intended voice room or opened the host Go Live feed, unmute the host, and verify your output volume. For continued silence or echo, use the private support link. No paid action, automatic message, or host change occurred.',
 [{type:1,components:[{type:2,style:5,label:'Private Support',url:support},{type:2,style:5,label:'Game Room',url:game}]}]);
}
