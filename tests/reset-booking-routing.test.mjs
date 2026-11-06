import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('customer checkout links bypass form redirect restrictions and branded Stripe is authorized',()=>{
 const page=read('site/booking.html');
 for(const lane of ['studio','events']) assert.match(page,new RegExp('href="/checkout/'+lane+'"'));
 assert.doesNotMatch(page,/<form/);
 assert.match(read('netlify.toml'),/form-action[^\n]+https:\/\/donate\.rmsglobalpublishing\.com;/);
 assert.match(read('netlify.toml'),/from = "\/booking"/);
});
test('every service card selects a supported offer and every local home anchor exists',()=>{
 const home=read('site/index.html'), booking=read('site/booking.html');
 const choices=[...home.matchAll(/booking\?service=([a-z-]+)#choose/g)].map(m=>m[1]);
 assert.equal(choices.length,10);
 for(const c of choices) assert.ok(booking.includes('value="'+c+'"'));
 for(const m of home.matchAll(/href="#([^"]+)"/g)) assert.ok(home.includes('id="'+m[1]+'"'),m[1]);
 assert.doesNotMatch(read('site/app.js'),/loadScript\('\/studio-(?:final-)?upgrade.js'\)/);
 assert.doesNotMatch(read('site/brand-upgrade.js'),/script.src = '\/studio-upgrade.js'/);
 assert.match(read('site/styles.css'),/\.lux-card::before\{[^}]*pointer-events:none/);
 assert.match(booking,/does not submit a booking automatically/);
});

test('service checkout emits privacy-minimal attribution and protects outbound redirect',()=>{
 const handler=read('netlify/functions/service-checkout.mjs');
 assert.match(handler,/reset_checkout_redirect/);
 assert.match(handler,/lane: bucket, origin, at:/);
 assert.match(handler,/referrer-policy': 'no-referrer'/);
 assert.doesNotMatch(handler,/headers\.get\('x-forwarded-for'\)/);
 assert.doesNotMatch(handler,/headers\.get\('cookie'\)/);
});