// Authentication + authorization middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { httpError, asyncHandler } = require('../utils/httpError');

// Reads "Authorization: Bearer <token>" and returns the matching user (or null if no token)
async function userFromRequest(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw httpError(401, 'Your session has expired. Please log in again.');
    throw httpError(401, 'Invalid token. Please log in again.');
  }
  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, 'The account for this token no longer exists.');
  return user;
}

// protect: the route needs a logged-in user
const protect = asyncHandler(async (req, res, next) => {
  const user = await userFromRequest(req);
  if (!user) throw httpError(401, 'Not authorized. Please log in.');
  req.user = user;
  next();
});

// optionalAuth: attach the user if a valid token exists, otherwise continue as a guest
const optionalAuth = asyncHandler(async (req, res, next) => {
  req.user = (await userFromRequest(req)) || null;
  next();
});

// adminOnly: must be used AFTER protect
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(httpError(403, 'Access denied. Administrators only.'));
  }
  next();
};

module.exports = { protect, optionalAuth, adminOnly };
