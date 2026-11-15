// Founder-approved, one-release Discord registration gate.
// Secrets stay inside Vercel's production build environment.
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export const REGISTRATION_MARKER='rmsgp-engineer-register-20261115:';

export function shouldRegister(env=process.env){
  if(env.VERCEL_ENV!=='production')return false;
  if(env.VERCEL_GIT_COMMIT_REF!=='main')return false;
  if(!String(env.VERCEL_GIT_COMMIT_MESSAGE||'').startsWith(REGISTRATION_MARKER))return false;
  if(env.VERCEL_GIT_REPO_OWNER&&env.VERCEL_GIT_REPO_OWNER!=='rms-global-publishing')return false;
  if(env.VERCEL_GIT_REPO_SLUG&&env.VERCEL_GIT_REPO_SLUG!=='reset-innercircle-config')return false;
  return true;
}

export function runOnce(env=process.env){
  if(!shouldRegister(env)){
    console.log('RMSGP_DISCORD_REGISTRATION=SKIPPED (not the authorized production release)');
    return;
  }
  if(env.DISCORD_CLIENT_ID!=='1540169303213609023'||env.DISCORD_GUILD_ID!=='1429398855681573038'||!env.DISCORD_TOKEN){
    throw Error('Authorized Discord credentials unavailable for registration. Deployment blocked; existing production is preserved.');
  }
  console.log('RMSGP_DISCORD_REGISTRATION=AUTHENTICATED_GUILD_DIFF_CHECK_START');
  const script=fileURLToPath(new URL('./register-commands.js',import.meta.url));
  const result=spawnSync(process.execPath,[script],{
    cwd:path.dirname(script),env,stdio:'inherit',timeout:90000,windowsHide:true
  });
  if(result.error)throw Error('Discord registration process failed: '+result.error.name);
  if(result.status!==0)throw Error('Discord registration refused or failed; deployment blocked.');
  console.log('RMSGP_DISCORD_REGISTRATION=COMPLETE');
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{runOnce(process.env)}catch(error){console.error(error.message);process.exitCode=1}
}
