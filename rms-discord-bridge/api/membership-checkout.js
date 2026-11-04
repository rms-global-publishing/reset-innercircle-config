import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { MEMBERSHIP_PLANS, createMembershipReference } from '../src/membership.js';
const CALLBACK = 'https://rms-discord-bridge.vercel.app/api/membership-checkout';
const COOKIE = 'reset_membership_oauth';
function reply(res, status, message) {
  res.statusCode = status;
  res.setHeader('cache-control','no-store');
  res.setHeader('content-type','text/plain; charset=utf-8');
  res.end(message);
}
function redirect(res, url, cookie) {
  res.statusCode = 302;
  res.setHeader('location',url);
  res.setHeader('cache-control','no-store');
  res.setHeader('referrer-policy','no-referrer');
  if(cookie)res.setHeader('set-cookie',cookie);
  res.end();
}
function sign(value, secret) {return createHmac('sha256',secret).update(value).digest('base64url');}
function equal(a,b){const x=Buffer.from(a||'');const y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y);}
function clearCookie(){return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/api/membership-checkout; Max-Age=0`;}
export default async function handler(req,res) {
  if(req.method!=='GET')return reply(res,405,'Method not allowed');
  const clientId=process.env.DISCORD_CLIENT_ID;
  const clientSecret=process.env.DISCORD_OAUTH_CLIENT_SECRET;
  const signingSecret=process.env.RMS_MEMBERSHIP_SIGNING_SECRET;
  const botToken=process.env.DISCORD_TOKEN;
  const guildId=process.env.DISCORD_GUILD_ID;
  if(!clientId||!clientSecret||!signingSecret||!botToken||!guildId)return reply(res,503,'Secure membership checkout is being configured. Please try again later.');
  const url=new URL(req.url,`https://${req.headers.host||'rms-discord-bridge.vercel.app'}`);
  const code=url.searchParams.get('code');
  if(!code){
    const tier=url.searchParams.get('tier');
    const interval=url.searchParams.get('interval');
    if(!Object.hasOwn(MEMBERSHIP_PLANS,tier)||!['monthly','annual'].includes(interval))return reply(res,400,'Invalid membership selection');
    const nonce=randomBytes(24).toString('base64url');
    const expires=Math.floor(Date.now()/1000)+600;
    const payload=`${tier}.${interval}.${expires}.${nonce}`;
    const state=`${payload}.${sign(payload,signingSecret)}`;
    const oauth=new URL('https://discord.com/oauth2/authorize');
    oauth.searchParams.set('client_id',clientId);
    oauth.searchParams.set('redirect_uri',CALLBACK);
    oauth.searchParams.set('response_type','code');
    oauth.searchParams.set('scope','identify');
    oauth.searchParams.set('state',state);
    return redirect(res,oauth.toString(),`${COOKIE}=${nonce}; HttpOnly; Secure; SameSite=Lax; Path=/api/membership-checkout; Max-Age=600`);
  }
  res.setHeader('set-cookie',clearCookie());
  const state=url.searchParams.get('state')||'';
  const parts=state.split('.');
  if(parts.length!==5)return reply(res,400,'Membership authorization expired. Start again from the membership page.');
  const [tier,interval,expiry,nonce,signature]=parts;
  const cookie=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(`${COOKIE}=`))?.slice(COOKIE.length+1);
  if(!cookie||!equal(cookie,nonce)||!equal(sign(parts.slice(0,4).join('.'),signingSecret),signature)||!Number.isSafeInteger(Number(expiry))||Number(expiry)<Date.now()/1000||Number(expiry)>Date.now()/1000+600||!Object.hasOwn(MEMBERSHIP_PLANS,tier)||!['monthly','annual'].includes(interval))return reply(res,400,'Membership authorization invalid or expired. Start again from the membership page.');
  try{
    const tokenResponse=await fetch('https://discord.com/api/oauth2/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,grant_type:'authorization_code',code,redirect_uri:CALLBACK})});
    if(!tokenResponse.ok)throw Error('oauth_exchange');
    const token=await tokenResponse.json();
    const identityResponse=await fetch('https://discord.com/api/users/@me',{headers:{authorization:`Bearer ${token.access_token}`}});
    if(!identityResponse.ok)throw Error('oauth_identity');
    const user=await identityResponse.json();
    if(!/^\d{15,22}$/.test(user.id||''))throw Error('invalid_identity');
    const memberResponse=await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${user.id}`,{headers:{authorization:`Bot ${botToken}`}});
    if(memberResponse.status===404)return redirect(res,'https://resetinnercircle.com/membership?membership=join-required');
    if(!memberResponse.ok)throw Error('guild_membership_check');
    const reference=createMembershipReference(user.id);
    const checkout=new URL(MEMBERSHIP_PLANS[tier][interval].url);
    checkout.searchParams.set('client_reference_id',reference);
    return redirect(res,checkout.toString());
  }catch(error){console.error('Membership checkout OAuth failed:',error.message);return reply(res,503,'Unable to verify your Discord membership right now. Please try again later.');}
}