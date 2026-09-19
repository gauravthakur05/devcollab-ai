const express = require('express');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/users/search?q=... — used by "add member" UI to find users by name/email/username
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return ApiResponse.success(res, { message: 'Users retrieved', data: { users: [] } });
  }
  const regex = new RegExp(q.trim(), 'i');
  const users = await User.find({
    $or: [{ fullName: regex }, { username: regex }, { email: regex }],
  })
    .select('fullName username email avatarColor role title')
    .limit(10);
  return ApiResponse.success(res, { message: 'Users retrieved', data: { users } });
}));

module.exports = router;
