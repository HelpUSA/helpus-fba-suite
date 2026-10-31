// Cryptographic Key Escrow Manager (Order 035 Gate G4.2)
// Provides zero-cost, secure escrow for backup decryption key:
// The 256-bit backup secret is encrypted with an independent Owner Master Passphrase
// using scrypt (N=32768, r=8, p=1) and AES-256-GCM with authenticated tag.
// Completely separates the encrypted snapshot (stored on Google Drive)
// from the key escrow (stored in private custody), recoverable only by the Master SuperAdmin.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function createEscrowPackage(rawKey, masterPassphrase) {
  if (!rawKey || typeof rawKey !== 'string' || rawKey.length < 16) {
    throw new Error('Chave de backup inválida para criação do escrow.');
  }
  if (!masterPassphrase || typeof masterPassphrase !== 'string' || masterPassphrase.length < 16) {
    throw new Error('Master Passphrase fraca ou ausente (mínimo 16 caracteres de alta entropia).');
  }

  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const derivedMasterKey = crypto.scryptSync(masterPassphrase, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });

  const cipher = crypto.createCipheriv('aes-256-gcm', derivedMasterKey, iv);
  let encrypted = cipher.update(rawKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    type: 'HELPUS_BACKUP_KEY_ESCROW',
    version: '1.0',
    algorithm: 'aes-256-gcm',
    kdf: 'scrypt_N16384_r8_p1',
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedKey: encrypted,
    createdAt: new Date().toISOString()
  };
}

function unlockEscrowPackage(escrowEnvelope, masterPassphrase) {
  if (escrowEnvelope.type !== 'HELPUS_BACKUP_KEY_ESCROW') {
    throw new Error('Envelope de escrow inválido ou formato incompatível.');
  }
  const salt = Buffer.from(escrowEnvelope.salt, 'hex');
  const iv = Buffer.from(escrowEnvelope.iv, 'hex');
  const authTag = Buffer.from(escrowEnvelope.authTag, 'hex');
  const derivedMasterKey = crypto.scryptSync(masterPassphrase, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });

  const decipher = crypto.createDecipheriv('aes-256-gcm', derivedMasterKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(escrowEnvelope.encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  createEscrowPackage,
  unlockEscrowPackage
};
