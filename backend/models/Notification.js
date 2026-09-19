const mongoose = require('mongoose');
const { Schema } = mongoose;

const NOTIFICATION_TYPES = [
  'TASK_ASSIGNED',
  'TASK_COMPLETED',
  'SPRINT_STARTED',
  'SPRINT_COMPLETED',
  'NEW_TEAM_MEMBER',
  'MENTION',
  'NEW_CHAT_MESSAGE',
  'CODE_REVIEW_COMPLETED',
];

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 500 },
    link: { type: String, default: null }, // frontend route to navigate to, e.g. /projects/:id
    isRead: { type: Boolean, default: false },
    relatedProjectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
