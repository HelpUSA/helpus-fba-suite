'use strict';
/** Static safety contract only: cannot replace real HTTP/DB tests. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const returns=read('src/app/api/returns/route.ts');
const sp=read('src/app/api/integrations/sp-api/inventory/route.ts');
const fiscal=read('src/app/api/integrations/fiscal/status/route.ts');
const nfe=read('src/app/api/nfe/import/route.ts');
const invoices=read('src/app/api/invoices/route.ts');
test('P3 returns GET and POST are authenticated and closed in production',()=>{
 assert.match(returns,/GET\(request: NextRequest\)/);
 assert.match(returns,/validateApiRequest\(request, false, true\)/);
 assert.match(returns,/validateApiRequest\(request, true\)/);
 assert.match(returns,/P3_NOT_HOMOLOGATED/);
 assert.match(returns,/Number\.isSafeInteger\(quantity\)/);
});
test('P2 SP-API inventory hides credential state and HTTP upstream details from anonymous clients',()=>{
 assert.match(sp,/validateApiRequest\(request, false, true\)/);
 assert.match(sp,/P2_NOT_HOMOLOGATED/);
 assert.doesNotMatch(sp,/errText\.slice/);
});
test('P2 fiscal status is protected and does not fabricate last sync',()=>{
 assert.match(fiscal,/validateApiRequest\(request, false, true\)/);
 assert.match(fiscal,/P2_NOT_HOMOLOGATED/);
 assert.doesNotMatch(fiscal,/lastSync: new Date\(\)\.toISOString\(\)/);
});
test('P2 NF-e parser caps payloads and fails closed for production',()=>{
 assert.match(nfe,/maxXmlBytes = 1024 \* 1024/);
 assert.match(nfe,/file\.size > maxXmlBytes/);
 assert.match(nfe,/P2_NOT_HOMOLOGATED/);
 assert.doesNotMatch(nfe,/Erro ao processar NF-e: \$\{/);
});
test('P2 invoices validate input and hide internal errors',()=>{
 assert.match(invoices,/Array\.isArray\(items\)/);
 assert.match(invoices,/P2_NOT_HOMOLOGATED/);
 assert.doesNotMatch(invoices,/error\?\.message/);
});
