const express = require('express');
const { getSprints, getSprint, createSprint, updateSprint, deleteSprint } = require('../controllers/sprintController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getSprints);
router.post('/', createSprint);
router.get('/:id', getSprint);
router.put('/:id', updateSprint);
router.delete('/:id', deleteSprint);

module.exports = router;
