import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = name => readFileSync(new URL("../" + name, import.meta.url), "utf8");
test("Reset public studio includes Studio Cloud entry without losing booking or Discord CTA", () => {
  const home = read("site/index.html");
  assert.match(home, /id="studio"/);
  assert.match(home, /https:\/\/creators\.rmsglobalpublishing\.com\/studio-cloud/);
  assert.match(home, /studio_discord_click" href="https:\/\/discord\.gg\/FJSCXCK5tF"/);
  assert.match(home, /href="\/booking"/);
});
test("existing Studio checkout and event checkout remain intact", () => {
  const booking = read("site/booking.html");
  assert.match(booking, /id="studio-cloud-heading"/);
  assert.match(booking, /private-room authorization/);
  assert.match(booking, /https:\/\/creators\.rmsglobalpublishing\.com\/studio-cloud/);
  assert.match(booking, /href="\/checkout\/studio"/);
  assert.match(booking, /href="\/checkout\/events"/);
  assert.doesNotMatch(booking, /automatic.*(licen[cs]e|desktop).*grant/i);
});
