const jwt = require('jsonwebtoken');
const { jwtSecret, isProd, cookieSameSite } = require('../config/env');

const COOKIE_NAME = 'token';
const DAY_MS = 24 * 60 * 60 * 1000;

function signToken(userId, remember) {
  return jwt.sign({ sub: userId }, jwtSecret, {
    algorithm: 'HS256',
    expiresIn: remember ? '7d' : '1d',
  });
}

function cookieOptions() {
  return {
    httpOnly: true, // JavaScript cannot read the cookie -> protects from XSS token theft
    secure: isProd || cookieSameSite === 'none', // HTTPS only in production
    sameSite: cookieSameSite, // CSRF defence-in-depth
    path: '/',
  };
}

function setAuthCookie(res, token, remember) {
  const options = cookieOptions();
  // Remember Me -> persistent 7-day cookie; otherwise a session cookie (cleared when browser closes)
  if (remember) options.maxAge = 7 * DAY_MS;
  res.cookie(COOKIE_NAME, token, options);
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
}

module.exports = { COOKIE_NAME, signToken, setAuthCookie, clearAuthCookie, verifyToken };
