import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCommandResponse,commandData} from '../rms-discord-bridge/src/commands.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const GUILD='1429398855681573038',ARENA='1429398859020370096';
const JOIN='https://discord.gg/DWyT4vskVW';
test('expired invite removed from all live gateway surfaces without changing offline event state',()=>{
 for(const p of ['site/arena.html','site/live.html','site/bridge.js','site/network.js','site/now-playing.js','site/now-playing.json','config/reset-media-virtual-studio-profile.json']){
  assert.doesNotMatch(read(p),/PAHFE5mGV/,p);
  assert.match(read(p),/DWyT4vskVW/,p);
 }
 const live=json('site/now-playing.json');
 assert.equal(live.default_state,'offline');
 assert.equal(live.discord_invite_url,JOIN);
 assert.ok(live.programs.every(p=>p.state==='offline'&&p.scheduled_start===null&&p.scheduled_end===null),'never fabricate LIVE status');
 assert.match(read('site/arena.html'),/signalcity\.rmsglobalpublishing\.com/);
 assert.match(read('site/arena.html'),/discord\.com\/channels\/1429398855681573038\/1429398859020370096/);
});
test('verified guild, Main Arena direct invite and voluntary access are preserved',()=>{
 const arena=json('config/reset-main-arena.json');
 assert.equal(arena.server_id,GUILD);assert.equal(arena.canonical_channel_id,ARENA);
 assert.equal(arena.discord_invite,'https://discord.gg/qeMuUUrjyf');
 assert.equal(arena.canonical_server_join_invite,JOIN);
 assert.equal(arena.legacy_valid_invite,'https://discord.gg/hE5TarQsut');
 assert.equal(arena.signal_city.mission_progress_authority,'SIGNAL_CITY_GAME_ONLY');
 assert.equal(arena.signal_city.player_saves_private,true);
});
test('Carl intent is configured but unverified premium and private-log protections remain fail closed',()=>{
 const carl=json('config/carl-premium-automation.json');
 assert.equal(carl.guild.id,GUILD);
 assert.equal(carl.premium.payment_reconciliation.post_purchase_premium_entitlement,'VERIFIED_ACTIVE_GUILD_1429398855681573038');
 assert.equal(carl.premium.payment_reconciliation.independent_provider_activation_certified,true);
 assert.equal(carl.live_premium_audit_20261102.sticky_record_count,4);
 assert.equal(carl.premium_features.sticky_messages.live_state.verified_records,4);
 assert.equal(carl.premium_features.voice_role_links.live_state.records,0);
 assert.equal(carl.premium_features.auto_purge.live_state.configured_channels,0);
 assert.equal(carl.live_premium_audit_20261102.staff_only_log_permissions,'NOT_READ_BACK');
 assert.equal(carl.premium.payment_reconciliation.no_repurchase,true);
 assert.equal(carl.standard_features_to_harden.logging.live_state.privacy_verification,'UNVERIFIED_DISCORD_PERMISSION_READBACK_REQUIRED');
 const x=carl.signal_city_arena_20261102;
 assert.match(x.implementation_status,/PREMIUM_ACTIVE_SCOPED_STICKY_VERIFIED/);
 assert.equal(x.governance.no_new_paid_tools,true);
 assert.equal(x.governance.do_not_grant_membership_staff_rights_or_music_licenses,true);
 assert.equal(x.anti_spam.one_owner_per_event_and_correlation_id,true);
 assert.equal(x.host_runbook.length,7);
 assert.equal(x.approved_event_templates.length,4);
 assert.ok(x.approved_event_templates.every(e=>e.automatic_progress_award===false&&e.role!=='@everyone'));
 assert.equal(x.governance.retain_current_26_logging_switches,true);
});
test('existing slash commands route to live beta and Main Arena without publishing game XP or earnings',()=>{
 for(const name of ['events','missions','game']){
  const response=buildCommandResponse(name),body=response.embeds?.[0]?.description||'';
  assert.equal(response.ephemeral,false);
  assert.match(body,/discord\.com\/channels\/1429398855681573038\/1429398859020370096/);
  if(name==='events'){
   assert.match(body,/resetinnercircle\.com\/live\.html/);
   assert.match(body,/no event is described as LIVE/);
  }else{
   assert.match(body,/signalcity\.rmsglobalpublishing\.com/);
   assert.match(body,/Discord|game progress/);
  }
  assert.doesNotMatch(body,/@everyone|guarantee.+money/i);
 }
 const integration=json('config/rms-discord-integration.json');
 assert.deepEqual(integration.signal_city_arena_20261102.slash_commands_to_improve,['events','missions','game']);
 assert.equal(integration.signal_city_arena_20261102.mission_reward_grant,false);
 assert.ok(commandData.some(c=>c.name==='events')&&commandData.some(c=>c.name==='missions')&&commandData.some(c=>c.name==='game'));
 assert.equal(commandData.length,24,'preserve all previously installed command names and avoid unnecessary guild registration');
});
