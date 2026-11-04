import test from 'node:test';
import assert from 'node:assert/strict';
import { paidTierFromRoles, buildMembershipCommandResponse } from '../src/membership.js';
const keys=['RMS_MEMBER_ROLE_ID','RMS_PRO_ROLE_ID','RMS_EXECUTIVE_ROLE_ID'];
const before=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
for(let i=0;i<3;i++)process.env[keys[i]]=`role_${i+1}`;
process.env.RMS_MEMBERSHIP_PUBLIC_ENABLED='true';
test('paid tier maps only one verified role id',()=>{
  assert.equal(paidTierFromRoles(['role_1']),'tier_1');
  assert.equal(paidTierFromRoles(['role_2']),'tier_2');
  assert.equal(paidTierFromRoles(['role_3']),'tier_3');
  assert.equal(paidTierFromRoles(['role_1','role_2']),null);
  assert.equal(paidTierFromRoles(['unknown']),null);
});
test('paid member receives tier-specific guidance without duplicate checkout buttons',()=>{
  const response=buildMembershipCommandResponse('123456789012345678',['role_2']);
  assert.equal(response.ephemeral,true);
  assert.match(response.embeds[0].description,/expanded Pro resources/);
  assert.equal(response.components,undefined);
});
test('unconfigured role ids cannot establish paid tier',()=>{
  delete process.env.RMS_EXECUTIVE_ROLE_ID;
  assert.equal(paidTierFromRoles(['role_2']),null);
  for(let i=0;i<3;i++)process.env[keys[i]]=`role_${i+1}`;
});