const mongoose = require('mongoose');
const { Schema } = mongoose;

// A lightweight, denormalized activity feed entry. actorName/projectName are
// snapshotted at write time (a deliberate MongoDB denormalization) so the
// activity feed renders without extra population lookups on every load.
const activityLogSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    action: { type: String, required: true, maxlength: 200 }, // e.g. "created task", "moved task to Done"
    targetType: { type: String, enum: ['PROJECT', 'TASK', 'SPRINT', 'MEMBER', 'CHAT'], required: true },
    targetLabel: { type: String, default: '', maxlength: 200 },
  },
  { timestamps: true }
);

activityLogSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
