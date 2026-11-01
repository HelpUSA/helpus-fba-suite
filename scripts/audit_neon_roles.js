const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Native loader for .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const k = trimmed.substring(0, eqIdx).trim();
      let v = trimmed.substring(eqIdx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[k] = v;
    }
  }
}

async function auditRoles() {
  const prodUrl = process.env.DATABASE_URL;
  if (!prodUrl) throw new Error('DATABASE_URL is missing.');

  console.log('===============================================================');
  console.log('AUDITORIA DE ROLES E PRIVILÉGIOS NEON (ORDEM 041 - ITEM 4)');
  console.log('===============================================================');

  // 1. Audit on neondb
  console.log('\n--- 1. AUDITORIA EM PRODUÇÃO (neondb) ---');
  const prodClient = new Client({ connectionString: prodUrl, ssl: { rejectUnauthorized: true } });
  await prodClient.connect();

  const rolesRes = await prodClient.query(`
    SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin 
    FROM pg_roles 
    WHERE rolname NOT LIKE 'pg_%' 
    ORDER BY rolname;
  `);
  console.log('Roles no Cluster Neon:');
  console.table(rolesRes.rows);

  const stagingGrantsOnProd = await prodClient.query(`
    SELECT table_schema, table_name, privilege_type 
    FROM information_schema.role_table_grants 
    WHERE grantee = 'staging_operator' AND table_schema = 'public'
    ORDER BY table_name, privilege_type;
  `);
  console.log(`staging_operator permissões diretas em neondb: ${stagingGrantsOnProd.rows.length}`);

  const tables = ['warehouses', 'products', 'inventory_balances', 'invoices', 'invoice_items', 'stock_movements', 'sale_orders', 'returns'];
  const prodTableCounts = {};
  for (const t of tables) {
    const countRes = await prodClient.query(`SELECT count(*) FROM ${t};`);
    prodTableCounts[t] = parseInt(countRes.rows[0].count, 10);
  }
  console.log('Contagem de registros em neondb (PRODUÇÃO):');
  console.table(prodTableCounts);

  await prodClient.end();

  // 2. Audit on helpus_staging
  console.log('\n--- 2. AUDITORIA EM STAGING (helpus_staging) ---');
  const stagingUrl = process.env.STAGING_DATABASE_URL || prodUrl.replace('/neondb', '/helpus_staging');
  const stagingClient = new Client({ connectionString: stagingUrl, ssl: { rejectUnauthorized: true } });
  await stagingClient.connect();

  const stagingGrantsOnStaging = await stagingClient.query(`
    SELECT table_schema, table_name, privilege_type 
    FROM information_schema.role_table_grants 
    WHERE grantee = 'staging_operator' AND table_schema = 'public'
    ORDER BY table_name, privilege_type;
  `);
  console.log(`staging_operator permissões diretas em helpus_staging: ${stagingGrantsOnStaging.rows.length}`);

  const stagingTableCounts = {};
  for (const t of tables) {
    const countRes = await stagingClient.query(`SELECT count(*) FROM ${t};`);
    stagingTableCounts[t] = parseInt(countRes.rows[0].count, 10);
  }
  console.log('Contagem de registros em helpus_staging (STAGING):');
  console.table(stagingTableCounts);

  await stagingClient.end();
  console.log('\n✓ Auditoria de roles e isolamento concluída com sucesso.');
}

auditRoles().catch(err => {
  console.error('Erro na auditoria de roles:', err.message);
  process.exit(1);
});
