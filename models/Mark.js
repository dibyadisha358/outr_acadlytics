const mongoose = require('mongoose');

const SUBJECTS = ['OOPS', 'EECO', 'DM', 'AAD', 'OS', 'DAI'];

function calcGrade(total) {
  if (total >= 90) return 'A';
  if (total >= 75) return 'B';
  if (total >= 50) return 'C';
  return 'D';
}

const markSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, enum: SUBJECTS, required: true },
  midterm: { type: Number, required: true, min: 0, max: 20 },
  assignment: { type: Number, required: true, min: 0, max: 10 },
  quiz_attendance: { type: Number, required: true, min: 0, max: 10 },
  end_sem: { type: Number, required: true, min: 0, max: 60 },
  internal_total: { type: Number },
  final_total: { type: Number },
  grade: { type: String, enum: ['A', 'B', 'C', 'D'] },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

// Compound unique: one record per student per subject
markSchema.index({ studentId: 1, subject: 1 }, { unique: true });

markSchema.pre('save', function (next) {
  this.internal_total = this.midterm + this.assignment + this.quiz_attendance;
  this.final_total = this.internal_total + this.end_sem;
  this.grade = calcGrade(this.final_total);
  this.updatedAt = new Date();
  next();
});

markSchema.statics.SUBJECTS = SUBJECTS;
markSchema.statics.calcGrade = calcGrade;

module.exports = mongoose.model('Mark', markSchema);
