const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { restoreDatabase } = require('./restore_database');

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

async function testGdriveRestore() {
  const gdrivePath = 'G:\\Meu Drive\\Backup\\HelpUS_ERP_Database_Custody\\latest_backup.enc.json';
  console.log('1. Checking file existence on Google Drive:', gdrivePath);
  if (!fs.existsSync(gdrivePath)) {
    throw new Error('Google Drive backup file not found: ' + gdrivePath);
  }

  const gdriveBuf = fs.readFileSync(gdrivePath);
  const gdriveSha256 = crypto.createHash('sha256').update(gdriveBuf).digest('hex');
  console.log(`2. Google Drive Snapshot Size: ${gdriveBuf.length} bytes, SHA-256: ${gdriveSha256}`);

  const localPath = path.join(__dirname, '..', 'backups', 'latest_backup.enc.json');
  const localBuf = fs.readFileSync(localPath);
  const localSha256 = crypto.createHash('sha256').update(localBuf).digest('hex');
  console.log(`3. Local Snapshot Size: ${localBuf.length} bytes, SHA-256: ${localSha256}`);

  if (gdriveSha256 !== localSha256) {
    throw new Error('SHA-256 mismatch between local and Google Drive copy!');
  }
  console.log('✓ SHA-256 verified identical bit-for-bit.');

  // Download simulation to verification directory
  const verifyDir = path.join(__dirname, '..', 'backups', 'verified_download');
  if (!fs.existsSync(verifyDir)) {
    fs.mkdirSync(verifyDir, { recursive: true });
  }
  const downloadedPath = path.join(verifyDir, 'downloaded_backup.enc.json');
  fs.copyFileSync(gdrivePath, downloadedPath);

  const downloadedBuf = fs.readFileSync(downloadedPath);
  const downloadedSha256 = crypto.createHash('sha256').update(downloadedBuf).digest('hex');
  if (downloadedSha256 !== gdriveSha256) {
    throw new Error('Downloaded snapshot SHA-256 mismatch!');
  }
  console.log('✓ Downloaded verification snapshot SHA-256 verified identical.');

  // Restore drill into staging database
  console.log('4. Initiating staging restore drill using staging_operator...');
  const stagingUrl = process.env.STAGING_DATABASE_URL;
  const prodIdentity = 'ep-blue-heart-b7dxkz6z.c-13.us-east-1.aws.neon.tech/neondb';

  const audit = await restoreDatabase(downloadedPath, stagingUrl, prodIdentity);
  console.log('✓ Restore drill completed successfully:');
  console.log(JSON.stringify(audit, null, 2));

  return {
    gdriveSha256,
    size: gdriveBuf.length,
    audit
  };
}

testGdriveRestore()
  .then(res => {
    console.log('ALL_TESTS_PASSED');
    process.exit(0);
  })
  .catch(err => {
    console.error('TEST_FAILED:', err);
    process.exit(1);
  });
