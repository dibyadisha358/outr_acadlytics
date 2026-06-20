const express = require('express');
const router = express.Router();
const { getStudentMarks, upsertMark, updateMark, bulkUpsert, deleteMark } = require('../controllers/markController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/student/:studentId', getStudentMarks);
router.post('/', upsertMark);
router.post('/bulk', bulkUpsert);
router.put('/:id', updateMark);
router.delete('/:id', deleteMark);

module.exports = router;
