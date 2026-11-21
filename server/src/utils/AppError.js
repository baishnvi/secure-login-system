class AppError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // optional field-level errors
    this.isOperational = true;
  }
}

module.exports = AppError;
