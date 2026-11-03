import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCommandResponse} from '../rms-discord-bridge/src/commands.js';
const read=(name)=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('studio and stage route to distinct verified Discord voice rooms',()=>{
 const studio=buildCommandResponse('studio').embeds[0].description;
 const stage=buildCommandResponse('stage').embeds[0].description;
 assert.ok(studio.includes('FJSCXCK5tF'));
 assert.ok(studio.includes('1468103128279941272'));
 assert.ok(stage.includes('q9THymJDBe'));
 assert.ok(stage.includes('1435167634520932453'));
 assert.ok(!stage.includes('1468103128279941272'));
});
test('public studio booking preserves existing Stripe routes and adds DAW, consent, access guidance',()=>{
 const html=read('site/booking.html');
 for(const val of ['studio-voice-guide','FJSCXCK5tF','q9THymJDBe','mix-minus','48 kHz','consent','verified payment','/checkout/studio','/checkout/events'])assert.ok(html.includes(val),val);
 assert.ok(html.includes('written scope'));
 assert.ok(read('site/index.html').includes('data-event="studio_discord_click" href="https://discord.gg/FJSCXCK5tF"'));
});
