const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskCommentSchema = new Schema(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 3000 },
  },
  { timestamps: true }
);

taskCommentSchema.index({ taskId: 1, createdAt: 1 });

module.exports = mongoose.model('TaskComment', taskCommentSchema);
