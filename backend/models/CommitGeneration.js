const mongoose = require('mongoose');
const { Schema } = mongoose;

const commitGenerationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    changedFiles: { type: [String], default: [] },
    diff: { type: String, default: '' },
    description: { type: String, default: '', maxlength: 1000 },
    commitType: {
      type: String,
      enum: ['feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'perf'],
      required: true,
    },
    commitMessage: { type: String, required: true },
    summary: { type: String, required: true },
    detailedExplanation: { type: String, required: true },
    provider: { type: String, default: 'mock' },
  },
  { timestamps: true }
);

commitGenerationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CommitGeneration', commitGenerationSchema);
