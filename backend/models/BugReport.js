const mongoose = require('mongoose');
const { Schema } = mongoose;

const bugReportSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    language: { type: String, required: true, maxlength: 40 },
    code: { type: String, required: true },
    errorMessage: { type: String, default: '', maxlength: 2000 },
    stackTrace: { type: String, default: '', maxlength: 5000 },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    possibleCause: { type: String, required: true },
    explanation: { type: String, required: true },
    suggestedFix: { type: String, required: true },
    fixedCode: { type: String, default: '' },
    confidence: { type: Number, min: 0, max: 100, required: true },
    provider: { type: String, default: 'mock' },
  },
  { timestamps: true }
);

bugReportSchema.index({ userId: 1, createdAt: -1 });
bugReportSchema.index({ projectId: 1 });

module.exports = mongoose.model('BugReport', bugReportSchema);
