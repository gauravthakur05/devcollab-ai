const express = require('express');
const {
  codeReview,
  getCodeReviewHistory,
  bugDetection,
  getBugReportHistory,
  commitMessage,
  getCommitHistory,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/code-review', codeReview);
router.get('/code-review/history', getCodeReviewHistory);
router.post('/bug-detection', bugDetection);
router.get('/bug-detection/history', getBugReportHistory);
router.post('/commit-message', commitMessage);
router.get('/commit-message/history', getCommitHistory);

module.exports = router;
