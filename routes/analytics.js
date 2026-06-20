const express = require('express');
const router = express.Router();
const {
  overview, subjectWise, topPerformers,
  atRisk, internalVsEndSem, gradeDistribution
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', overview);
router.get('/subject-wise', subjectWise);
router.get('/top-performers', topPerformers);
router.get('/at-risk', atRisk);
router.get('/internal-vs-endsem', internalVsEndSem);
router.get('/grade-distribution', gradeDistribution);

module.exports = router;
