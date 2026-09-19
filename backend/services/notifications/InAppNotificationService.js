const NotificationServiceInterface = require('./NotificationServiceInterface');
const Notification = require('../../models/Notification');

// Writes notifications directly to MongoDB and (if available) pushes them
// over Socket.IO for live delivery. A future SES/SNS-backed service could
// implement the same interface to additionally send email/SMS.
class InAppNotificationService extends NotificationServiceInterface {
  constructor(io) {
    super();
    this.io = io || null;
  }

  async notify({ userId, type, title, message, link = null, relatedProjectId = null }) {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      relatedProjectId,
    });

    if (this.io) {
      this.io.to(`user:${userId}`).emit('notification:new', notification);
    }

    return notification;
  }
}

module.exports = InAppNotificationService;
