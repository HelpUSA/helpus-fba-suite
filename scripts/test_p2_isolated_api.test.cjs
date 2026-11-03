'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const sp=read('src/app/api/integrations/sp-api/inventory/route.ts');
const fiscal=read('src/app/api/integrations/fiscal/status/route.ts');
test('SP-API read is authorized, production-gated and redacts upstream responses',()=>{
 assert.match(sp,/validateApiRequest\(request, false, true\)/);
 assert.match(sp,/P2_NOT_HOMOLOGATED/);
 assert.doesNotMatch(sp,/errText\.slice/);
});
test('Fiscal status avoids anonymous disclosure and invented last sync',()=>{
 assert.match(fiscal,/validateApiRequest\(request, false, true\)/);
 assert.match(fiscal,/P2_NOT_HOMOLOGATED/);
 assert.doesNotMatch(fiscal,/lastSync: new Date\(\)\.toISOString\(\)/);
});
const nfe=read('src/app/api/nfe/import/route.ts');
const invoices=read('src/app/api/invoices/route.ts');
test('NF-e XML import requires auth, caps payload and stays disabled in production',()=>{
 assert.match(nfe,/validateApiRequest\(req, true\)/);
 assert.match(nfe,/maxXmlBytes = 1024 \* 1024/);
 assert.match(nfe,/P2_NOT_HOMOLOGATED/);
 assert.doesNotMatch(nfe,/Erro ao processar NF-e: \$\{/);
});
test('Commercial invoices require auth, validate data and sanitize internal failures',()=>{
 assert.match(invoices,/validateApiRequest\(req, true\)/);
 assert.match(invoices,/Array\.isArray\(items\)/);
 assert.match(invoices,/P2_NOT_HOMOLOGATED/);
 assert.doesNotMatch(invoices,/error\?\.message/);
});
