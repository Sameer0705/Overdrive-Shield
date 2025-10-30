const crypto = require('crypto');

const NONCE_TTL_MS = Number(process.env.NONCE_TTL_MS || 5 * 60 * 1000); // 5 minutes

const store = new Map(); // nonce -> { message, expiresAt }

function createNonce() {
  const bytes = crypto.randomBytes(16).toString('hex');
  const nonce = bytes;
  const issuedAt = new Date().toISOString();
  const message = [
    `Login to ${process.env.APP_DOMAIN || 'localhost'}`,
    '',
    `URI: ${process.env.APP_BASE_URL || 'http://localhost:3000'}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join('\n');

  store.set(nonce, { message, expiresAt: Date.now() + NONCE_TTL_MS });
  return { nonce, message };
}

function getMessageForNonce(nonce) {
  const entry = store.get(nonce);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(nonce);
    return null;
  }
  return entry.message;
}

function consumeNonce(nonce) {
  const entry = store.get(nonce);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(nonce);
    return false;
  }
  store.delete(nonce);
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [nonce, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(nonce);
  }
}, Math.min(NONCE_TTL_MS, 60 * 1000)).unref();

module.exports = { createNonce, getMessageForNonce, consumeNonce };
