import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldRegister,runOnce,REGISTRATION_MARKER} from '../src/register-one-time.js';

const authorized={
  VERCEL_ENV:'production',
  VERCEL_GIT_COMMIT_REF:'main',
  VERCEL_GIT_COMMIT_MESSAGE:REGISTRATION_MARKER+' one-time commands',
  VERCEL_GIT_REPO_OWNER:'rms-global-publishing',
  VERCEL_GIT_REPO_SLUG:'reset-innercircle-config'
};
test('only exact production release marker enables remote command registration',()=>{
 assert.equal(shouldRegister(authorized),true);
 for(const change of [
  {VERCEL_ENV:'preview'},
  {VERCEL_ENV:'development'},
  {VERCEL_ENV:undefined},
  {VERCEL_GIT_COMMIT_REF:'feature'},
  {VERCEL_GIT_COMMIT_REF:undefined},
  {VERCEL_GIT_COMMIT_MESSAGE:'normal release'},
  {VERCEL_GIT_COMMIT_MESSAGE:undefined},
  {VERCEL_GIT_REPO_OWNER:'other'},
  {VERCEL_GIT_REPO_SLUG:'other'}
 ])assert.equal(shouldRegister({...authorized,...change}),false,JSON.stringify(change));
});
test('normal build skips all Discord calls without credentials',()=>{
 assert.doesNotThrow(()=>runOnce({...authorized,VERCEL_ENV:'preview'}));
 assert.doesNotThrow(()=>runOnce({...authorized,VERCEL_GIT_COMMIT_MESSAGE:'future commit'}));
});
test('authorized build refuses missing or wrong credentials before any request',()=>{
 assert.throws(()=>runOnce({...authorized}),/credentials unavailable/);
 assert.throws(()=>runOnce({...authorized,DISCORD_TOKEN:'test',DISCORD_CLIENT_ID:'wrong',DISCORD_GUILD_ID:'1429398855681573038'}),/credentials unavailable/);
});
