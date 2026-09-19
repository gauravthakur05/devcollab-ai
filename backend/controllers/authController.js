const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { isValidEmail, isStrongPassword } = require('../utils/validators');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, confirmPassword } = req.body;

  if (!fullName || !username || !email || !password) {
    return ApiResponse.error(res, { message: 'Full name, username, email and password are all required', statusCode: 400 });
  }
  if (confirmPassword !== undefined && confirmPassword !== password) {
    return ApiResponse.error(res, { message: 'Passwords do not match', statusCode: 400 });
  }
  if (!isValidEmail(email)) {
    return ApiResponse.error(res, { message: 'Please provide a valid email address', statusCode: 400 });
  }
  if (!isStrongPassword(password)) {
    return ApiResponse.error(res, {
      message: 'Password must be at least 8 characters and include a letter and a number',
      statusCode: 400,
    });
  }
  if (username.length < 3) {
    return ApiResponse.error(res, { message: 'Username must be at least 3 characters', statusCode: 400 });
  }

  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    return ApiResponse.error(res, { message: 'An account with this email already exists', statusCode: 409 });
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return ApiResponse.error(res, { message: 'This username is already taken', statusCode: 409 });
  }

  const user = await User.create({ fullName, username, email, password });
  const token = generateToken(user._id);

  return ApiResponse.success(res, {
    message: 'Account created successfully',
    statusCode: 201,
    data: { token, user: user.toSafeObject() },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return ApiResponse.error(res, { message: 'Email and password are required', statusCode: 400 });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user) {
    return ApiResponse.error(res, { message: 'Invalid email or password', statusCode: 401 });
  }

  if (!user.isActive) {
    return ApiResponse.error(res, { message: 'This account has been deactivated', statusCode: 401 });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return ApiResponse.error(res, { message: 'Invalid email or password', statusCode: 401 });
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  return ApiResponse.success(res, {
    message: 'Login successful',
    data: { token, user: user.toSafeObject() },
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, {
    message: 'Current user retrieved',
    data: { user: req.user.toSafeObject() },
  });
});

// POST /api/auth/logout
// Stateless JWT: logout is handled by the client discarding the token.
// This endpoint exists so the frontend has a consistent, testable call
// and so future server-side token blacklisting can slot in here.
const logout = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, { message: 'Logged out successfully', data: {} });
});

module.exports = { register, login, getMe, logout };
