const mongoose = require('mongoose');
const { Schema } = mongoose;

const SPRINT_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED'];

const sprintSchema = new Schema(
  {
    name: { type: String, required: [true, 'Sprint name is required'], trim: true, maxlength: 120 },
    goal: { type: String, trim: true, default: '', maxlength: 1000 },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: SPRINT_STATUSES, default: 'PLANNED' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

sprintSchema.index({ projectId: 1 });
sprintSchema.index({ status: 1 });

module.exports = mongoose.model('Sprint', sprintSchema);
module.exports.SPRINT_STATUSES = SPRINT_STATUSES;
