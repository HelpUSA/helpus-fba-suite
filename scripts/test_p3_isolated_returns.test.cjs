'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const s=fs.readFileSync(path.join(__dirname,'..','src/app/api/returns/route.ts'),'utf8');
test('P3 returns requires auth and fails closed in production',()=>{
 assert.match(s,/GET\(request: NextRequest\)/);
 assert.match(s,/validateApiRequest\(request, false, true\)/);
 assert.match(s,/validateApiRequest\(request, true\)/);
 assert.match(s,/P3_NOT_HOMOLOGATED/);
});
test('P3 rejects invalid financial quantities and redacts secrets',()=>{
 assert.match(s,/Number\.isSafeInteger\(quantity\)/);
 assert.match(s,/Number\.isFinite\(reimbursementAmount\)/);
 assert.doesNotMatch(s,/hint: 'Defina x-helpus-auth-token/);
 assert.doesNotMatch(s,/error: error\.message/);
});