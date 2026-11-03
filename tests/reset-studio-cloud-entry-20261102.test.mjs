import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = name => readFileSync(new URL("../" + name, import.meta.url), "utf8");
test("Reset public studio includes RMS Global Publishing Cloud Studio XR entry without losing booking or Discord CTA", () => {
  const home = read("site/index.html");
  assert.match(home, /id="studio"/);
  assert.match(home, /RMS Global Publishing Cloud Studio XR/);
  assert.match(home, /https:\/\/discord\.gg\/FJSCXCK5tF/);
  assert.match(home, /https:\/\/creators\.rmsglobalpublishing\.com\/studio-cloud/);
  assert.match(home, /studio_discord_click" href="https:\/\/discord\.gg\/FJSCXCK5tF"/);
  assert.match(home, /href="\/booking"/);
});
test("existing Studio checkout and event checkout remain intact", () => {
  const booking = read("site/booking.html");
  assert.match(booking, /id="studio-cloud-heading"/);
  assert.match(booking, /open RMS Global Publishing Cloud Studio XR/);
  assert.match(booking, /private-room authorization/);
  assert.match(booking, /https:\/\/creators\.rmsglobalpublishing\.com\/studio-cloud/);
  assert.match(booking, /href="\/checkout\/studio"/);
  assert.match(booking, /href="\/checkout\/events"/);
  assert.doesNotMatch(booking, /automatic.*(licen[cs]e|desktop).*grant/i);
});

test("RMS Global Publishing Cloud Studio XR names are consistent across Reset discovery while Discord stays Reset Media Studios", () => {
  const pages = ["site/index.html", "site/arena.html", "site/helpstudio.html", "site/live.html", "site/partner.html", "site/bridge.js", "site/network.js"];
  for (const name of pages) {
    const page = read(name);
    assert.match(page, /Cloud Studio XR/, name);
    assert.doesNotMatch(page, /Reset Media Virtual Studio|Virtual Studio™|Virtual Studio Services/, name);
  }
  const booking = read("site/booking.html");
  assert.match(booking, /Reset Media Studios voice room/);
  assert.match(booking, /https:\/\/discord\.gg\/FJSCXCK5tF/);
  assert.match(booking, /RMS Global Publishing Cloud Studio XR/);
});

test("Reset shows the independently operated RMS Global Publishing identity and protects the existing studio-room name", () => {
  const home = read("site/index.html");
  const booking = read("site/booking.html");
  assert.match(home, /Official operator: RMS Global Publishing/);
  assert.match(home, /initials in our company name stand for Reset Media Studios/);
  assert.match(home, /not affiliated with other businesses using similar Reset Media or Reset Studios names/);
  assert.match(booking, /Independent studio identity:/);
  assert.match(booking, /RMS Global Publishing is the public-facing studio operator/);
  assert.match(booking, /not affiliated with similarly named third-party media or studio businesses/);
  assert.match(booking, /https:\/\/discord\.gg\/FJSCXCK5tF/);
  const ldMatch = home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ldMatch, "structured organization metadata exists");
  const nodes = JSON.parse(ldMatch[1])["@graph"];
  const operator = nodes.find(item => item["@type"] === "Organization");
  const website = nodes.find(item => item["@type"] === "WebSite");
  assert.equal(operator.name, "RMS Global Publishing");
  assert.equal(operator.url, "https://rmsglobalpublishing.com/");
  assert.equal(website.publisher["@id"], operator["@id"]);
  assert.match(home, /"name":"Reset Inner Circle"/);
});

test("Reset sitemap contains public studio booking and accurate change dates without exposing private studio URLs", () => {
  const sitemap = read("site/sitemap.xml");
  const robots = read("site/robots.txt");
  assert.match(sitemap, /https:\/\/resetinnercircle\.com\/booking/);
  assert.match(sitemap, /<lastmod>2026-11-03<\/lastmod>/);
  assert.doesNotMatch(sitemap, /creator\/studio-cloud|\/checkout\/studio/);
  assert.match(robots, /Sitemap: https:\/\/resetinnercircle\.com\/sitemap\.xml/);
});
