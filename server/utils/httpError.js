// Small helpers so controllers stay short and readable.

// Create an error with an HTTP status code. The error handler turns it into JSON.
function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// Wraps async controllers so any thrown error reaches the central error handler.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Escape user text before using it inside a RegExp (prevents regex injection).
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { httpError, asyncHandler, escapeRegex };
