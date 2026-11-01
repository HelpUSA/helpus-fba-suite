if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { spawn } = require('child_process');

// Construct isolated Staging URL
const parsedUrl = new URL(process.env.DATABASE_URL);
parsedUrl.pathname = '/helpus_staging';
const stagingUrl = parsedUrl.toString();

const env = {
  ...process.env,
  TEST_DATABASE_URL: stagingUrl
};

console.log("=== EXECUTANDO HOMOLOGAÇÃO P0 NO BANCO STAGING ISOLADO ===");
console.log(`Target DB: helpus_staging (Server-Side Verified)`);

const child = spawn(process.execPath, [require('path').join(__dirname, 'full_p0_homologation_suite.js')], {
  env,
  stdio: 'inherit'
});

child.on('exit', (code) => {
  console.log(`\nHomologation suite finalizada com exit code: ${code}`);
  process.exit(code);
});
