const Mark = require('../models/Mark');
const Student = require('../models/Student');

const SUBJECTS = ['OOPS', 'EECO', 'DM', 'AAD', 'OS', 'DAI'];

// @GET /api/analytics/overview
exports.overview = async (req, res) => {
  const totalStudents = await Student.countDocuments();
  const totalMarks = await Mark.countDocuments();

  const gradeAgg = await Mark.aggregate([
    { $group: { _id: '$grade', count: { $sum: 1 } } }
  ]);

  const gradeDist = { A: 0, B: 0, C: 0, D: 0 };
  gradeAgg.forEach(g => { gradeDist[g._id] = g.count; });

  // Overall average per student (avg across all subjects)
  const studentAvgs = await Mark.aggregate([
    { $group: { _id: '$studentId', avg: { $avg: '$final_total' } } }
  ]);

  const avgScore = studentAvgs.length
    ? Math.round(studentAvgs.reduce((s, x) => s + x.avg, 0) / studentAvgs.length)
    : 0;

  const atRiskCount = await getAtRiskCount();
  const passRate = totalStudents
    ? Math.round(((totalStudents - atRiskCount) / totalStudents) * 100)
    : 0;

  res.json({ success: true, data: { totalStudents, totalMarks, gradeDist, avgScore, atRiskCount, passRate } });
};

// @GET /api/analytics/subject-wise
exports.subjectWise = async (req, res) => {
  const data = await Mark.aggregate([
    {
      $group: {
        _id: '$subject',
        avgInternal: { $avg: '$internal_total' },
        avgEndSem: { $avg: '$end_sem' },
        avgFinal: { $avg: '$final_total' },
        maxFinal: { $max: '$final_total' },
        minFinal: { $min: '$final_total' },
        gradeA: { $sum: { $cond: [{ $eq: ['$grade', 'A'] }, 1, 0] } },
        gradeB: { $sum: { $cond: [{ $eq: ['$grade', 'B'] }, 1, 0] } },
        gradeC: { $sum: { $cond: [{ $eq: ['$grade', 'C'] }, 1, 0] } },
        gradeD: { $sum: { $cond: [{ $eq: ['$grade', 'D'] }, 1, 0] } },
        passRate: { $avg: { $cond: [{ $gte: ['$final_total', 40] }, 1, 0] } },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        subject: '$_id',
        avgInternal: { $round: ['$avgInternal', 1] },
        avgEndSem: { $round: ['$avgEndSem', 1] },
        avgFinal: { $round: ['$avgFinal', 1] },
        maxFinal: 1, minFinal: 1,
        gradeDist: { A: '$gradeA', B: '$gradeB', C: '$gradeC', D: '$gradeD' },
        passRate: { $round: [{ $multiply: ['$passRate', 100] }, 1] },
        count: 1, _id: 0
      }
    }
  ]);

  res.json({ success: true, data });
};

// @GET /api/analytics/top-performers?limit=10
exports.topPerformers = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const performers = await Mark.aggregate([
    { $group: { _id: '$studentId', avg: { $avg: '$final_total' }, subjects: { $sum: 1 } } },
    { $match: { subjects: 6 } },
    { $sort: { avg: -1 } },
    { $limit: limit },
    { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'student' } },
    { $unwind: '$student' },
    { $project: { name: '$student.name', regdNo: '$student.regdNo', avg: { $round: ['$avg', 1] } } }
  ]);

  res.json({ success: true, data: performers });
};

// @GET /api/analytics/at-risk
exports.atRisk = async (req, res) => {
  // At risk: final_total < 40 in ANY subject
  const riskyMarks = await Mark.aggregate([
    { $match: { $or: [{ final_total: { $lt: 40 } }, { end_sem: { $lt: 24 } }] } },
    {
      $group: {
        _id: '$studentId',
        failedSubjects: { $push: '$subject' },
        lowScores: { $push: { subject: '$subject', score: '$final_total' } }
      }
    },
    { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'student' } },
    { $unwind: '$student' },
    { $project: { name: '$student.name', regdNo: '$student.regdNo', failedSubjects: 1, lowScores: 1 } }
  ]);

  res.json({ success: true, count: riskyMarks.length, data: riskyMarks });
};

// @GET /api/analytics/internal-vs-endsem
exports.internalVsEndSem = async (req, res) => {
  const data = await Mark.aggregate([
    {
      $group: {
        _id: '$subject',
        avgInternal: { $avg: { $multiply: [{ $divide: ['$internal_total', 40] }, 100] } },
        avgEndSem: { $avg: { $multiply: [{ $divide: ['$end_sem', 60] }, 100] } }
      }
    },
    {
      $project: {
        subject: '$_id', _id: 0,
        avgInternalPct: { $round: ['$avgInternal', 1] },
        avgEndSemPct: { $round: ['$avgEndSem', 1] }
      }
    }
  ]);
  res.json({ success: true, data });
};

// @GET /api/analytics/grade-distribution
exports.gradeDistribution = async (req, res) => {
  const data = await Mark.aggregate([
    {
      $group: {
        _id: { subject: '$subject', grade: '$grade' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.subject',
        grades: { $push: { grade: '$_id.grade', count: '$count' } }
      }
    },
    { $project: { subject: '$_id', _id: 0, grades: 1 } }
  ]);
  res.json({ success: true, data });
};

async function getAtRiskCount() {
  const result = await Mark.aggregate([
    { $match: { final_total: { $lt: 40 } } },
    { $group: { _id: '$studentId' } },
    { $count: 'count' }
  ]);
  return result[0]?.count || 0;
}
