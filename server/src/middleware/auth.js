const User = require('../models/User');
const AppError = require('../utils/AppError');
const { COOKIE_NAME, verifyToken } = require('../utils/token');

// Protects routes: reads the JWT from the HttpOnly cookie, verifies it, loads the user.
module.exports = async (req, _res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw new AppError(401, 'Authentication required');

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new AppError(401, 'Session expired or invalid. Please log in again.');
    }

    const user = await User.findById(payload.sub);
    if (!user) throw new AppError(401, 'Authentication required');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
