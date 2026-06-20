const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  regdNo: { type: String, required: true, unique: true, trim: true },
  createdAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

studentSchema.virtual('marks', {
  ref: 'Mark',
  localField: '_id',
  foreignField: 'studentId'
});

module.exports = mongoose.model('Student', studentSchema);
