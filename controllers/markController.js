const Mark = require('../models/Mark');
const Student = require('../models/Student');
const SUBJECTS = require('../models/Mark').schema.path('subject').enumValues;

// @GET /api/marks/:studentId — all marks for a student
exports.getStudentMarks = async (req, res) => {
  const student = await Student.findById(req.params.studentId);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const marks = await Mark.find({ studentId: req.params.studentId }).sort({ subject: 1 });
  const overallAvg = marks.length
    ? Math.round(marks.reduce((s, m) => s + m.final_total, 0) / marks.length)
    : 0;

  res.json({ success: true, student, marks, overallAvg });
};

// @POST /api/marks — create/update marks for a student+subject
exports.upsertMark = async (req, res) => {
  const { studentId, subject, midterm, assignment, quiz_attendance, end_sem } = req.body;

  if (!SUBJECTS.includes(subject))
    return res.status(400).json({ success: false, message: `Invalid subject. Valid: ${SUBJECTS.join(', ')}` });

  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const markData = { studentId, subject, midterm, assignment, quiz_attendance, end_sem, updatedBy: req.user._id };

  const mark = await Mark.findOneAndUpdate(
    { studentId, subject },
    markData,
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Manually trigger pre-save logic since findOneAndUpdate bypasses it
  mark.internal_total = mark.midterm + mark.assignment + mark.quiz_attendance;
  mark.final_total = mark.internal_total + mark.end_sem;
  mark.grade = Mark.calcGrade(mark.final_total);
  await mark.save();

  res.status(200).json({ success: true, mark });
};

// @PUT /api/marks/:id
exports.updateMark = async (req, res) => {
  let mark = await Mark.findById(req.params.id);
  if (!mark) return res.status(404).json({ success: false, message: 'Mark record not found' });

  const fields = ['midterm', 'assignment', 'quiz_attendance', 'end_sem'];
  fields.forEach(f => { if (req.body[f] !== undefined) mark[f] = req.body[f]; });
  mark.updatedBy = req.user._id;
  await mark.save(); // triggers pre-save

  res.json({ success: true, mark });
};

// @POST /api/marks/bulk — save all 6 subjects for one student at once
exports.bulkUpsert = async (req, res) => {
  const { studentId, marks } = req.body;
  // marks = [{ subject, midterm, assignment, quiz_attendance, end_sem }, ...]

  if (!Array.isArray(marks) || marks.length === 0)
    return res.status(400).json({ success: false, message: 'marks array required' });

  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const results = [];
  for (const m of marks) {
    const markDoc = await Mark.findOneAndUpdate(
      { studentId, subject: m.subject },
      { studentId, subject: m.subject, midterm: m.midterm, assignment: m.assignment, quiz_attendance: m.quiz_attendance, end_sem: m.end_sem, updatedBy: req.user._id },
      { upsert: true, new: true, runValidators: true }
    );
    markDoc.internal_total = markDoc.midterm + markDoc.assignment + markDoc.quiz_attendance;
    markDoc.final_total = markDoc.internal_total + markDoc.end_sem;
    markDoc.grade = Mark.calcGrade(markDoc.final_total);
    await markDoc.save();
    results.push(markDoc);
  }

  res.json({ success: true, marks: results });
};

// @DELETE /api/marks/:id
exports.deleteMark = async (req, res) => {
  const mark = await Mark.findByIdAndDelete(req.params.id);
  if (!mark) return res.status(404).json({ success: false, message: 'Mark not found' });
  res.json({ success: true, message: 'Mark deleted' });
};
