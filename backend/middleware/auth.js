const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verifies the JWT on the Authorization header (Bearer <token>) and attaches
 * the authenticated user to req.user. Handles missing/invalid/expired tokens
 * and inactive/deleted users with proper 401 responses.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.error(res, { message: 'Not authorized, no token provided', statusCode: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return ApiResponse.error(res, { message: 'Session expired, please log in again', statusCode: 401 });
    }
    return ApiResponse.error(res, { message: 'Invalid authentication token', statusCode: 401 });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return ApiResponse.error(res, { message: 'User belonging to this token no longer exists', statusCode: 401 });
  }
  if (!user.isActive) {
    return ApiResponse.error(res, { message: 'This account has been deactivated', statusCode: 401 });
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to a set of roles. Use after `protect`.
 * Usage: router.post('/', protect, authorize('ADMIN', 'PROJECT_MANAGER'), handler)
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return ApiResponse.error(res, { message: 'Not authorized', statusCode: 401 });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return ApiResponse.error(res, {
      message: `Role '${req.user.role}' is not permitted to perform this action`,
      statusCode: 403,
    });
  }
  next();
};

module.exports = { protect, authorize };
