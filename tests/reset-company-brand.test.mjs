import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const critical=new Set(["index.html","bridge.js","membership.html","helpstudio.html","helpstudio.js","now-playing.js"]);
test("Reset public site uses RMS GP or full company name",()=>{
 const root=path.resolve("site");
 const findings=[];let reviewed=0;
 for(const name of fs.readdirSync(root)){
  if(!/\.(html|js)$/.test(name))continue;
  reviewed++;
  const lines=fs.readFileSync(path.join(root,name),"utf8").split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
   for(const m of lines[i].matchAll(/\bRMS\b/g)){
    if(/^\s+(?:GP\b|GLOBAL PUBLISHING\b)/i.test(lines[i].slice(m.index+3)))continue;
    findings.push({file:name,line:i+1,blocking:critical.has(name)});
   }
  }
 }
 const blocking=findings.filter(x=>x.blocking);
 console.log("RMS GP Reset gateway source inventory",JSON.stringify({reviewed,legacyReferences:findings.length,blocking: blocking.length,findings:findings.slice(0,25)}));
 assert.equal(blocking.length,0,"Core Reset business-facing site copy must use the approved company name");
});
