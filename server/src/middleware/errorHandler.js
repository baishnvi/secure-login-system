const { ZodError } = require('zod');
const { isProd } = require('../config/env');

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Centralised error handling: every error ends here and gets a safe response.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  // Validation errors (zod) -> 400 with field-level messages
  if (err instanceof ZodError) {
    const errors = {};
    for (const issue of err.issues) {
      const field = issue.path[0] || 'form';
      if (!errors[field]) errors[field] = issue.message;
    }
    return res.status(400).json({ success: false, message: 'Please correct the highlighted fields', errors });
  }

  // Duplicate key (unique email index)
  if (err && err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists',
      errors: { email: 'An account with this email already exists' },
    });
  }

  // Malformed JSON body
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }

  if (err && err.isOperational) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message, ...(err.errors && { errors: err.errors }) });
  }

  // Unknown error: log internally, never leak details to the client
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
    ...(!isProd && { debug: err?.message }),
  });
}

module.exports = { notFound, errorHandler };
