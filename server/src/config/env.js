require('dotenv').config();

const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_ORIGIN'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy server/.env.example to server/.env and fill in the values.');
  process.exit(1);
}

const isProd = process.env.NODE_ENV === 'production';
const sameSite = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();

module.exports = {
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientOrigin: process.env.CLIENT_ORIGIN.replace(/\/$/, ''),
  cookieSameSite: ['lax', 'strict', 'none'].includes(sameSite) ? sameSite : 'lax',
  trustProxy: Number(process.env.TRUST_PROXY) || 0,
};
