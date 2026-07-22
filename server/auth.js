const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getJWTSecret() {
  const envSecret = process.env.JWT_SECRET;
  if (envSecret && envSecret !== 'CHANGE_ME_TO_RANDOM_SECRET') return envSecret;

  const secretPath = path.resolve(__dirname, '.jwt-secret');
  try {
    return fs.readFileSync(secretPath, 'utf-8').trim();
  } catch {
    const newSecret = crypto.randomBytes(64).toString('hex');
    fs.writeFileSync(secretPath, newSecret, { mode: 0o600 });
    return newSecret;
  }
}

const JWT_SECRET = getJWTSecret();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { generateToken, authMiddleware, JWT_SECRET };
