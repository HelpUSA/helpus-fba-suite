// Exhaustive Read-Only Audit of Production Roles and Table Privileges (Order 031 Point 3)
// Performs pure read-only inspection of all PostgreSQL roles on neondb without any GRANT or REVOKE operations.
// Reports exact CONNECT, SCHEMA, and TABLE privileges (SELECT, INSERT, UPDATE, DELETE) across all production tables.
// Strict TLS enforced (rejectUnauthorized: true).

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const l of lines) {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([^=]+)=(.*)$/);
    if (m) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      env[m[1].trim()] = v;
    }
  }
  return env;
}

async function auditProductionRolesReadOnly() {
  console.log('===============================================================');
  console.log('AUDITORIA SOMENTE LEITURA DE ROLES & PRIVILÉGIOS EM NEONDB (ORDEM 031)');
  console.log('===============================================================');

  const env = loadEnv(path.join(__dirname, '..', '.env.local'));
  const prodUrl = process.env.DATABASE_URL || env.DATABASE_URL;

  const client = new Client({
    connectionString: prodUrl,
    ssl: { rejectUnauthorized: true }
  });

  await client.connect();
  console.log('✓ Conectado a neondb com TLS estrito (rejectUnauthorized=true).');

  // 1. Audit Database & Schema Level Privileges for all login roles
  const rolesRes = await client.query(`
    SELECT rolname,
           rolsuper,
           rolcanlogin,
           has_database_privilege(rolname, 'neondb', 'CONNECT') AS can_connect,
           has_database_privilege(rolname, 'neondb', 'CREATE') AS can_create_db,
           has_schema_privilege(rolname, 'public', 'USAGE') AS can_use_schema,
           has_schema_privilege(rolname, 'public', 'CREATE') AS can_create_in_schema
    FROM pg_roles
    WHERE rolcanlogin = true
    ORDER BY rolname;
  `);

  console.log('\n--- 1. Privilégios no Banco neondb e Schema public ---');
  console.table(rolesRes.rows);

  // 2. Audit Table-Level Permissions (SELECT, INSERT, UPDATE, DELETE)
  const tables = ['inventory_balances', 'products', 'warehouses', 'invoices', 'invoice_items', 'stock_movements', 'sale_orders', 'returns'];
  const loginRoles = rolesRes.rows.map(r => r.rolname);

  console.log('\n--- 2. Matriz de Privilégios em Tabelas Produtivas (Somente Leitura) ---');
  const tableAudit = [];

  for (const role of loginRoles) {
    for (const tbl of tables) {
      const permRes = await client.query(`
        SELECT has_table_privilege($1, $2, 'SELECT') AS can_select,
               has_table_privilege($1, $2, 'INSERT') AS can_insert,
               has_table_privilege($1, $2, 'UPDATE') AS can_update,
               has_table_privilege($1, $2, 'DELETE') AS can_delete
      `, [role, tbl]);

      const { can_select, can_insert, can_update, can_delete } = permRes.rows[0];
      tableAudit.push({
        role,
        table: tbl,
        can_select,
        can_insert,
        can_update,
        can_delete
      });
    }
  }

  // Summary per role
  console.log('\n--- 3. Síntese de Acesso por Papel ---');
  for (const role of loginRoles) {
    const roleRows = tableAudit.filter(r => r.role === role);
    const writeCount = roleRows.filter(r => r.can_insert || r.can_update || r.can_delete).length;
    const readCount = roleRows.filter(r => r.can_select).length;
    console.log(`- Role '${role}': Leitura em ${readCount}/8 tabelas | Escrita em ${writeCount}/8 tabelas`);
  }

  // Specific check for staging_operator in neondb
  const stagingOpRows = tableAudit.filter(r => r.role === 'staging_operator');
  const stagingHasWrite = stagingOpRows.some(r => r.can_insert || r.can_update || r.can_delete);
  console.log(`\n✓ Validação de Bloqueio: staging_operator possui escrita em neondb? ${stagingHasWrite ? 'SIM (ALERTA)' : 'NÃO (TOTALMENTE ISOLADO)'}`);

  if (stagingHasWrite) {
    throw new Error('🛑 FALHA: staging_operator possui permissões de escrita na base neondb!');
  }

  await client.end();
  console.log('\n===============================================================');
  console.log('✓ AUDITORIA SOMENTE LEITURA CONCLUÍDA SEM ALTERAÇÕES DE GRANTS');
  console.log('===============================================================');
}

auditProductionRolesReadOnly().catch(err => {
  console.error('\n❌ Erro na auditoria passiva:', err);
  process.exit(1);
});
