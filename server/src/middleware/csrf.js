const AppError = require('../utils/AppError');

// CSRF protection for cookie auth:
//  1) cookie is SameSite (set in utils/token.js)
//  2) every state-changing request must carry a custom header. Browsers cannot send a custom
//     header cross-site without a CORS preflight, and CORS only allows CLIENT_ORIGIN.
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

module.exports = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
    return next(new AppError(403, 'Request blocked by CSRF protection'));
  }
  next();
};
