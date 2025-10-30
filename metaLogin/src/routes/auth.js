const express = require('express');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { createNonce, consumeNonce, getMessageForNonce } = require('../utils/nonceStore');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER || 'metamask-auth-api';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'metamask-auth-client';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const APP_DOMAIN = process.env.APP_DOMAIN || 'localhost';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

function requireBody(fields) {
  return (req, res, next) => {
    for (const f of fields) {
      if (!req.body || typeof req.body[f] === 'undefined' || req.body[f] === null || req.body[f] === '') {
        return res.status(400).json({ error: `Missing field: ${f}` });
      }
    }
    next();
  };
}

router.get('/nonce', (req, res) => {
  const { nonce, message } = createNonce();
  res.json({ nonce, message });
});

router.post('/verify', requireBody(['signature', 'nonce']), async (req, res) => {
  try {
    if (!JWT_SECRET) return res.status(500).json({ error: 'Server not configured' });

    const { signature, nonce } = req.body;
    const message = getMessageForNonce(nonce);
    if (!message) return res.status(400).json({ error: 'Invalid or expired nonce' });

    let recoveredAddress;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const address = ethers.getAddress(recoveredAddress);

    if (!consumeNonce(nonce)) {
      return res.status(400).json({ error: 'Nonce already used or expired' });
    }

    const token = jwt.sign(
      { sub: address.toLowerCase(), addr: address.toLowerCase() },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: JWT_EXPIRES_IN,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }
    );

    res.json({ token, address: address.toLowerCase() });
  } catch (err) {
    return res.status(500).json({ error: 'Verification failed' });
  }
});

router.get('/me', (req, res) => {
  try {
    const auth = req.headers['authorization'] || '';
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    if (!JWT_SECRET) return res.status(500).json({ error: 'Server not configured' });

    const token = parts[1];
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    return res.json({ address: payload.addr, sub: payload.sub, iat: payload.iat, exp: payload.exp });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
