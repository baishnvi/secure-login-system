const rateLimit = require('express-rate-limit');

// Brute-force protection: max 10 FAILED login attempts / 15 minutes / IP.
// Successful logins are not counted.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// Light limit for registration to reduce abuse.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many sign-up attempts. Please try again later.' },
});

module.exports = { loginLimiter, registerLimiter };
