// RMS Global Publishing - member-safe Sound Engineer access.
// No direct agent or workstation control is exposed through Discord.
export const ENGINEER_OPTIONS=[
 {name:'Show all Sound Engineer help',value:'menu'},
 {name:'Run an interactive sound check',value:'soundcheck'},
 {name:'I hear voices, but no music',value:'music'},
 {name:'Everything is silent',value:'silent'},
 {name:'Echo, feedback or doubled sound',value:'echo'},
 {name:'Black screen or missing gameplay',value:'video'},
 {name:'Recordings, disclosure and consent',value:'recording'},
 {name:'MPC production and track export',value:'mpc'},
 {name:'Host readiness (authorized staff)',value:'readiness'},
 {name:'Request private Studio technical help',value:'request'},
];
const allowed=new Set(ENGINEER_OPTIONS.map(o=>o.value));
const assistanceModes=new Set(['soundcheck','music','silent','readiness']);
export function engineerMode(input){
 const options=input?.data?.options||input?.options?.data||[];
 const value=options.find(o=>o?.name==='issue')?.value;
 return typeof value==='string'&&allowed.has(value)?value:'menu';
}
export function engineerUsesAssistance(name,mode='menu'){
 return name==='soundcheck'||(name==='engineer'&&assistanceModes.has(mode));
}
const studio='https://discord.com/channels/1429398855681573038/1468103128279941272';
const arena='https://discord.com/channels/1429398855681573038/1429398859020370096';
const help='https://resetinnercircle.com/helpstudio';
const support='https://creators.rmsglobalpublishing.com/creator/support';
const footer={text:'RMS Global Publishing | Cloud Studio XR | Member-safe engineering'};
function details(mode){
 switch(mode){
 case 'request':return {title:'Engineer: private technical request',body:'For a persistent audio, video, Stream Deck, MPC, recording or session issue, open Private Support below and sign in to CreatorHub. Explain the affected room, what you can hear or see, when the problem began, and the steps already tried. The Receptionist owns the private case and can escalate authorized host-side diagnostics. This Discord command does not create a new ticket or directly wake the private ChatGPT Sound Engineer.'};
 case 'echo':return {title:'Engineer: echo or feedback',body:'1. Use headphones. 2. Mute duplicate microphone or speaker returns; do not send Discord playback into its own input. 3. Check whether the echo affects voice, music, or both. 4. If it persists, open private support so the studio host can check Wave Link and the actual delivery route. No mic or mixer settings are changed by this command.'};
 case 'video':return {title:'Engineer: missing video',body:'1. Open the intended host Go Live stream, not merely the voice or virtual-camera tile. 2. Check that the host is actually sharing the intended screen or game. 3. If no host feed is available, report it privately; PS5, HDMI and capture-device diagnostics require the authorized host computer. This command cannot switch scenes or turn on streaming.'};
 case 'recording':return {title:'Engineer: recording safety',body:'Recording and streaming require session-specific notice and participant consent. Ask the host which source is being recorded, whether both voice and music are cleared, and how files will be protected. Use /startsession for a temporary reference, /savesession for naming, and /exportstems for the export checklist. No recording is started or stopped by Discord.'};
 case 'mpc':return {title:'Engineer: MPC and production',body:'Use /startsession to generate a temporary session reference, /savesession for versioned project naming, /exportstems for preparation, and /requestmix for the approved service route. Only owned/licensed samples and source audio may be used. The private RMS GP Sound Engineer can assist a booked or authorized host; this command does not open or control any member DAW or grant a paid session.'};
 default:return {title:'RMS GP Sound Engineer | Cloud Studio XR',body:'Use **/engineer** with the optional **issue** selector:\n- **Sound check:** interactive private audio help\n- **Voices, no music / Everything silent:** save the symptom in existing assistance\n- **Echo / Video / Recording / MPC:** targeted safe guidance\n- **Request:** open private CreatorHub Studio technical support\n- **Host readiness:** authorized studio staff only\n\nOr type **/soundcheck** for the fastest guided audio check.\n\nCloud Studio XR is a voice room. If the slash-command picker is missing, open the Main Arena text chat. Audio delivery and recording are not verified by a command alone; a listener must confirm them. No public access to the Founder workstation or private ChatGPT Sound Engineer is granted.'};
 }
}
export function engineerPublicResponse(mode='menu'){
 const result=details(mode);
 return {ephemeral:true,embeds:[{color:0xc8a24a,title:result.title,description:result.body+'\n\n**Cloud Studio XR:** '+studio+'\n**Main Arena text commands:** '+arena,footer}],
  components:[{type:1,components:[
   {type:2,style:5,label:'Studio Help',url:help},
   {type:2,style:5,label:'Private Support',url:support},
   {type:2,style:5,label:'Cloud Studio XR',url:studio}
  ]}]
 };
}
