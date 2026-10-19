import test from 'node:test';
import assert from 'node:assert/strict';
import profiles from '../desktop/test-profile.cjs';
import fs from 'node:fs';
test('release 0.5 uses a stable fresh profile without changing previous or test profiles',()=>{
 const config=JSON.parse(fs.readFileSync(new URL('../config/multiplayer.json',import.meta.url)));
 const args=['C:/profiles',config.serverUrl,config.profileDirectory];
 const fresh=profiles.testOptions([],...args);
 assert.notEqual(fresh.profile,profiles.testOptions([],'C:/profiles',config.serverUrl).profile);
 assert.equal(fresh.profile,profiles.testOptions([],...args).profile);
 assert.equal(fresh.serverUrl,config.serverUrl);
 assert.equal(profiles.testOptions(['--test-profile=A'],...args).profile,profiles.testOptions(['--test-profile=A'],'C:/profiles',config.serverUrl).profile);
 assert.throws(()=>profiles.testOptions([],'C:/profiles',config.serverUrl,'../old'));
});
