const XLSX = require('xlsx');
const Student = require('../models/Student');
const Mark = require('../models/Mark');

// @GET /api/students
exports.getStudents = async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = search
    ? { $or: [{ name: new RegExp(search, 'i') }, { regdNo: new RegExp(search, 'i') }] }
    : {};

  const total = await Student.countDocuments(query);
  const students = await Student.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ regdNo: 1 });

  res.json({ success: true, total, page: parseInt(page), students });
};

// @GET /api/students/:id
exports.getStudent = async (req, res) => {
  const student = await Student.findById(req.params.id).populate('marks');
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, student });
};

// @POST /api/students
exports.createStudent = async (req, res) => {
  const { name, regdNo } = req.body;
  const student = await Student.create({ name, regdNo });
  res.status(201).json({ success: true, student });
};

// @PUT /api/students/:id
exports.updateStudent = async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, student });
};

// @DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  await Mark.deleteMany({ studentId: student._id });
  await student.deleteOne();
  res.json({ success: true, message: 'Student and associated marks deleted' });
};

// @POST /api/students/import  — Excel upload
exports.importStudents = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an Excel file' });

  const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);

  const results = { inserted: 0, skipped: 0, errors: [] };

  for (const row of rows) {
    const name = row['Name'] || row['name'];
    const regdNo = String(row['Registration Number'] || row['regdNo'] || '').trim();

    if (!name || !regdNo) { results.skipped++; continue; }

    try {
      await Student.findOneAndUpdate(
        { regdNo },
        { name: name.trim(), regdNo },
        { upsert: true, new: true, runValidators: true }
      );
      results.inserted++;
    } catch (err) {
      results.errors.push({ regdNo, error: err.message });
    }
  }

  res.json({ success: true, message: `Import complete`, ...results });
};
