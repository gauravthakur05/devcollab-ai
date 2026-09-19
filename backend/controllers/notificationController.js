const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  return ApiResponse.success(res, { message: 'Notifications retrieved', data: { notifications, unreadCount } });
});

// PUT /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
  if (!notification) return ApiResponse.error(res, { message: 'Notification not found', statusCode: 404 });

  notification.isRead = true;
  await notification.save();

  return ApiResponse.success(res, { message: 'Notification marked as read', data: { notification } });
});

// PUT /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });
  return ApiResponse.success(res, { message: 'All notifications marked as read', data: {} });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
