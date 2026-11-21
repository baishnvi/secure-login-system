const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/token');

const BCRYPT_ROUNDS = 12;

// A real bcrypt hash used to keep response time similar when the email does not exist
// (prevents user enumeration through timing differences).
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_ROUNDS);

const INVALID_CREDENTIALS = 'Invalid email or password';

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;

    const existing = await User.exists({ email });
    if (existing) {
      throw new AppError(409, 'An account with this email already exists', {
        email: 'An account with this email already exists',
      });
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ full_name, email, password_hash });

    res.status(201).json({ success: true, message: 'Account created. You can now log in.', user });
  } catch (err) {
    next(err); // duplicate-key race condition is handled in errorHandler (code 11000)
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;

    const user = await User.findOne({ email }).select('+password_hash');
    const passwordOk = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);

    // Same message + same status for "unknown email" and "wrong password"
    if (!user || !passwordOk) throw new AppError(401, INVALID_CREDENTIALS);

    const token = signToken(user.id, remember);
    setAuthCookie(res, token, remember);

    res.status(200).json({ success: true, message: 'Login successful', user }); // toJSON strips password_hash
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me   (protected)
exports.me = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// POST /api/auth/logout
exports.logout = (_req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: 'Logged out' });
};
