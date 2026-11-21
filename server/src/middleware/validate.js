// Validates + normalises req.body with a zod schema. Failures go to the central error handler.
module.exports = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) return next(result.error);
  req.body = result.data; // normalised data (trimmed, lowercased email, etc.)
  next();
};
