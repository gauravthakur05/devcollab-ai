const mongoose = require('mongoose');
const { Schema } = mongoose;

const PROJECT_STATUSES = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'];

// Members are embedded as {user, role} pairs (a common, denormalized MongoDB
// pattern for small, frequently-read-together subsets of data) while the
// canonical role-per-project-per-user lives here rather than a separate
// join table, since a project's member list is always read as a whole.
const memberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'VIEWER'], default: 'DEVELOPER' },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    name: { type: String, required: [true, 'Project name is required'], trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    status: { type: String, enum: PROJECT_STATUSES, default: 'PLANNING' },
    deadline: { type: Date },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [memberSchema], default: [] },
    color: { type: String, default: '#6E56CF' },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ name: 'text', description: 'text' });

projectSchema.methods.isMember = function isMember(userId) {
  const uid = String(userId);
  return String(this.owner) === uid || this.members.some((m) => String(m.user) === uid);
};

projectSchema.methods.roleOf = function roleOf(userId) {
  const uid = String(userId);
  if (String(this.owner) === uid) return 'ADMIN';
  const m = this.members.find((mm) => String(mm.user) === uid);
  return m ? m.role : null;
};

module.exports = mongoose.model('Project', projectSchema);
module.exports.PROJECT_STATUSES = PROJECT_STATUSES;
