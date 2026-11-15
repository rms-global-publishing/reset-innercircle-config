// Discord interaction ACK is immediate; Vercel handles the protected slow state lookup.
// Never log interaction tokens, user messages, or credential-bearing webhook URLs.
export async function editDiscordDeferred(interaction,reply,transport=fetch){
 const app=interaction?.application_id,token=interaction?.token;
 if(!/^\d{15,22}$/.test(String(app||''))||typeof token!=='string'||token.length<20||token.length>256)throw Error('Invalid deferred interaction identity');
 if(reply?.type!==4||!reply?.data)throw Error('Deferred response is not an editable message');
 const {flags,...data}=reply.data;
 const body={...data,allowed_mentions:{parse:[]}};
 const url='https://discord.com/api/v10/webhooks/'+app+'/'+encodeURIComponent(token)+'/messages/@original';
 const response=await transport(url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(6500)});
 if(!response.ok)throw Error('Deferred edit failed with HTTP '+response.status);
 return {ok:true,status:response.status};
}
export function shouldDeferAudio(interaction,commandName,engineerMode){
 const token=String(interaction?.data?.custom_id||'');
 if(interaction?.type===3&&token.startsWith('sc1.'))return true;
 if(interaction?.type===2&&commandName==='engineer'&&['music','silent','readiness'].includes(engineerMode))return true;
 if(interaction?.type===3&&token.startsWith('ra1.')&&!/^ra1\.(scope|takeover|release)\./.test(token))return true;
 if(interaction?.type===5&&token.startsWith('ra1.'))return true;
 return false;
}
