if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { spawn } = require('child_process');

const parsedUrl = new URL(process.env.DATABASE_URL);
parsedUrl.pathname = '/helpus_staging';
const stagingUrl = parsedUrl.toString();

const env = {
  ...process.env,
  TEST_DATABASE_URL: stagingUrl
};

console.log("=== EXECUTANDO RESTAURAÇÃO DE SNAPSHOT EM STAGING ===");
const child = spawn(process.execPath, [require('path').join(__dirname, 'restore_database.js')], {
  env,
  stdio: 'inherit'
});

child.on('exit', (code) => {
  console.log(`\nRestore script finalizado com exit code: ${code}`);
  process.exit(code);
});
