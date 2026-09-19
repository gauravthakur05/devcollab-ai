const { getAIService } = require('../services/ai');
const AIReview = require('../models/AIReview');
const BugReport = require('../models/BugReport');
const CommitGeneration = require('../models/CommitGeneration');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getNotificationService } = require('../services/notifications');

// POST /api/ai/code-review
const codeReview = asyncHandler(async (req, res) => {
  const { code, language, projectId } = req.body;

  if (!code || !code.trim()) return ApiResponse.error(res, { message: 'Code is required', statusCode: 400 });
  if (!language) return ApiResponse.error(res, { message: 'Programming language is required', statusCode: 400 });

  const ai = getAIService();
  const result = await ai.reviewCode({ code, language });

  const review = await AIReview.create({
    userId: req.user._id,
    projectId: projectId || null,
    language,
    code,
    ...result,
  });

  const notifier = getNotificationService();
  await notifier.notify({
    userId: req.user._id,
    type: 'CODE_REVIEW_COMPLETED',
    title: 'Code review complete',
    message: `Your AI code review finished with a quality score of ${result.qualityScore}/100.`,
    link: '/ai/code-review',
    relatedProjectId: projectId || null,
  });

  return ApiResponse.success(res, { message: 'Code review completed', statusCode: 201, data: { review } });
});

// GET /api/ai/code-review/history
const getCodeReviewHistory = asyncHandler(async (req, res) => {
  const reviews = await AIReview.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
  return ApiResponse.success(res, { message: 'Review history retrieved', data: { reviews } });
});

// POST /api/ai/bug-detection
const bugDetection = asyncHandler(async (req, res) => {
  const { code, errorMessage, stackTrace, language, projectId } = req.body;

  if (!code || !code.trim()) return ApiResponse.error(res, { message: 'Code is required', statusCode: 400 });
  if (!language) return ApiResponse.error(res, { message: 'Programming language is required', statusCode: 400 });

  const ai = getAIService();
  const result = await ai.detectBug({ code, errorMessage, stackTrace, language });

  const report = await BugReport.create({
    userId: req.user._id,
    projectId: projectId || null,
    language,
    code,
    errorMessage: errorMessage || '',
    stackTrace: stackTrace || '',
    ...result,
  });

  return ApiResponse.success(res, { message: 'Bug analysis completed', statusCode: 201, data: { report } });
});

// GET /api/ai/bug-detection/history
const getBugReportHistory = asyncHandler(async (req, res) => {
  const reports = await BugReport.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
  return ApiResponse.success(res, { message: 'Bug report history retrieved', data: { reports } });
});

// POST /api/ai/commit-message
const commitMessage = asyncHandler(async (req, res) => {
  const { changedFiles, diff, description, projectId } = req.body;

  if ((!changedFiles || changedFiles.length === 0) && !diff && !description) {
    return ApiResponse.error(res, { message: 'Provide changed files, a diff, or a description', statusCode: 400 });
  }

  const ai = getAIService();
  const result = await ai.generateCommitMessage({ changedFiles: changedFiles || [], diff: diff || '', description: description || '' });

  const generation = await CommitGeneration.create({
    userId: req.user._id,
    projectId: projectId || null,
    changedFiles: changedFiles || [],
    diff: diff || '',
    description: description || '',
    ...result,
  });

  return ApiResponse.success(res, { message: 'Commit message generated', statusCode: 201, data: { generation } });
});

// GET /api/ai/commit-message/history
const getCommitHistory = asyncHandler(async (req, res) => {
  const generations = await CommitGeneration.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
  return ApiResponse.success(res, { message: 'Commit history retrieved', data: { generations } });
});

module.exports = {
  codeReview,
  getCodeReviewHistory,
  bugDetection,
  getBugReportHistory,
  commitMessage,
  getCommitHistory,
};
