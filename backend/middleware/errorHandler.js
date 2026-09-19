const ApiResponse = require('../utils/ApiResponse');

// Catches unmatched routes.
function notFound(req, res) {
  ApiResponse.error(res, { message: `Route not found: ${req.method} ${req.originalUrl}`, statusCode: 404 });
}

// Centralized error handler. Every asyncHandler-wrapped route and every
// next(err) call ends up here so error responses stay consistent.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `That ${field} is already in use`;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired, please log in again';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('[error]', err);
  }

  ApiResponse.error(res, { message, statusCode });
}

module.exports = { notFound, errorHandler };
