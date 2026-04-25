const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKey() {
  const raw = process.env.ENCRYPTION_KEY || 'fallback-key-change-in-production!!';
  return Buffer.from(raw.slice(0, 32).padEnd(32, '0'));
}

function encrypt(plaintext) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(ciphertext) {
  const [ivHex, encrypted] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encrypt, decrypt };
