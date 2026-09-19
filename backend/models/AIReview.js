const mongoose = require('mongoose');
const { Schema } = mongoose;

const aiReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    language: { type: String, required: true, maxlength: 40 },
    code: { type: String, required: true },
    qualityScore: { type: Number, min: 0, max: 100, required: true },
    complexity: { type: String, enum: ['LOW', 'MODERATE', 'HIGH'], required: true },
    maintainability: { type: String, enum: ['LOW', 'MODERATE', 'HIGH'], required: true },
    findings: {
      bugs: { type: [String], default: [] },
      securityIssues: { type: [String], default: [] },
      performanceIssues: { type: [String], default: [] },
      codeSmells: { type: [String], default: [] },
    },
    suggestions: { type: [String], default: [] },
    improvedCode: { type: String, default: '' },
    provider: { type: String, default: 'mock' },
  },
  { timestamps: true }
);

aiReviewSchema.index({ userId: 1, createdAt: -1 });
aiReviewSchema.index({ projectId: 1 });

module.exports = mongoose.model('AIReview', aiReviewSchema);
