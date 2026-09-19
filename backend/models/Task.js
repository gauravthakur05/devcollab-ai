const mongoose = require('mongoose');
const { Schema } = mongoose;

const TASK_STATUSES = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'CODE_REVIEW', 'TESTING', 'DONE'];
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const taskSchema = new Schema(
  {
    title: { type: String, required: [true, 'Task title is required'], trim: true, maxlength: 200 },
    description: { type: String, trim: true, default: '', maxlength: 5000 },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    sprintId: { type: Schema.Types.ObjectId, ref: 'Sprint', default: null },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: TASK_STATUSES, default: 'BACKLOG' },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'MEDIUM' },
    labels: { type: [String], default: [] },
    dueDate: { type: Date, default: null },
    order: { type: Number, default: 0 }, // position within its column, for stable drag/drop ordering
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ sprintId: 1 });
taskSchema.index({ title: 'text' });

module.exports = mongoose.model('Task', taskSchema);
module.exports.TASK_STATUSES = TASK_STATUSES;
module.exports.TASK_PRIORITIES = TASK_PRIORITIES;
