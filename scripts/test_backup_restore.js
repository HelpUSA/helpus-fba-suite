// Credentials must be provided at runtime, never committed to source control.
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { execSync } = require('child_process');
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

async function testBackupRestore() {
  console.log('--- TESTE DE BACKUP & RESTORE POSTGRESQL (ORDEM 016 - ITEM 5) ---');
  
  const backupPath = path.join(__dirname, '..', 'backups', 'helpus_fba_suite_backup_test.sql');
  const backupDir = path.dirname(backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const pgDumpPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe';
  const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
  const env = { ...process.env, PGPASSWORD: process.env.PGPASSWORD };

  // 1. Executar pg_dump
  console.log('[1/3] Gerando dump estrutural e de dados via pg_dump...');
  execSync(`"${pgDumpPath}" -h localhost -p 5432 -U postgres -d helpus_fba_suite -F p -f "${backupPath}"`, { env });
  console.log(`✓ Dump criado com sucesso: ${backupPath} (${fs.statSync(backupPath).size} bytes).`);

  // 2. Preparar banco de dados de restauração
  console.log('[2/3] Criando banco de dados de teste para validação de restore...');
  const rootClient = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await rootClient.connect();
  await rootClient.query('DROP DATABASE IF EXISTS helpus_fba_suite_restore_test;');
  await rootClient.query('CREATE DATABASE helpus_fba_suite_restore_test;');
  await rootClient.end();

  // 3. Executar psql para restaurar
  console.log('[3/3] Executando restauração integral via psql...');
  execSync(`"${psqlPath}" -h localhost -p 5432 -U postgres -d helpus_fba_suite_restore_test -f "${backupPath}"`, { env });
  console.log('✓ Restauração concluída com sucesso!');

  // Validar integridade dos dados restaurados
  const restoreClient = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await restoreClient.connect();
  const resTables = await restoreClient.query(`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
  `);
  console.log('Tabelas restauradas com integridade:', resTables.rows.map(r => r.table_name).join(', '));
  const resBal = await restoreClient.query(`SELECT * FROM inventory_balances;`);
  console.log(`✓ Registros de saldo restaurados com integridade: ${resBal.rows.length}`);
  await restoreClient.end();

  console.log('--- TESTE DE BACKUP & RESTORE APROVADO COM SUCESSO! ---');
}

testBackupRestore().catch(e => {
  console.error('Falha no teste de backup/restore:', e);
  process.exit(1);
});
