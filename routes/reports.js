const express = require('express');
const router = express.Router();
const { generateStudentReport, classReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/student/:studentId', generateStudentReport);
router.get('/class', classReport);

module.exports = router;
