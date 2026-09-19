const express = require('express');
const { getMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/:projectId', getMessages);
router.post('/:projectId', sendMessage);

module.exports = router;
