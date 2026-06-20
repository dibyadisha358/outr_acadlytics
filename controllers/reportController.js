const PDFDocument = require('pdfkit');
const Mark = require('../models/Mark');
const Student = require('../models/Student');

const SUBJECTS = ['OOPS', 'EECO', 'DM', 'AAD', 'OS', 'DAI'];

// @GET /api/reports/student/:studentId
exports.generateStudentReport = async (req, res) => {
  const student = await Student.findById(req.params.studentId);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const marks = await Mark.find({ studentId: student._id }).sort({ subject: 1 });

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=report_${student.regdNo}.pdf`);
  doc.pipe(res);

  // ── Header ──
  doc.rect(0, 0, 595, 90).fill('#1A3C5E');
  doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
    .text('OUTR Acadlytics', 50, 22, { align: 'center' });
  doc.fontSize(11).font('Helvetica')
    .text('Student Academic Performance Report', 50, 52, { align: 'center' });
  doc.text('O.U.A.T., Bhubaneswar, Odisha', 50, 68, { align: 'center' });
  doc.fillColor('#1A3C5E');

  // ── Student Info ──
  doc.moveDown(2);
  const infoY = 110;
  doc.rect(40, infoY, 515, 60).fill('#F0F4F8').stroke('#CCCCCC');
  doc.fillColor('#1A3C5E').fontSize(13).font('Helvetica-Bold')
    .text(student.name, 55, infoY + 10);
  doc.fillColor('#555').fontSize(11).font('Helvetica')
    .text(`Registration No: ${student.regdNo}`, 55, infoY + 30)
    .text(`Academic Year: 2024-25`, 300, infoY + 10)
    .text(`Report Generated: ${new Date().toLocaleDateString('en-IN')}`, 300, infoY + 30);

  // ── Marks Table ──
  doc.moveDown(1.5);
  const tableTop = 195;
  const cols = { subject: 55, midterm: 160, assign: 225, quiz: 290, internal: 355, endSem: 415, total: 470, grade: 530 };

  // Table Header
  doc.rect(40, tableTop, 515, 22).fill('#1A3C5E');
  doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
  doc.text('Subject',   cols.subject, tableTop + 7);
  doc.text('Midterm\n/20', cols.midterm, tableTop + 2, { width: 55, align: 'center' });
  doc.text('Assign\n/10', cols.assign, tableTop + 2, { width: 55, align: 'center' });
  doc.text('Quiz+Att\n/10', cols.quiz, tableTop + 2, { width: 55, align: 'center' });
  doc.text('Internal\n/40', cols.internal, tableTop + 2, { width: 55, align: 'center' });
  doc.text('EndSem\n/60', cols.endSem, tableTop + 2, { width: 55, align: 'center' });
  doc.text('Total\n/100', cols.total, tableTop + 2, { width: 55, align: 'center' });
  doc.text('Grade', cols.grade, tableTop + 7);

  // Table Rows
  const SUBJECTS = ['OOPS', 'EECO', 'DM', 'AAD', 'OS', 'DAI'];
  let rowY = tableTop + 22;
  let totalAll = 0;

  SUBJECTS.forEach((subj, i) => {
    const m = marks.find(x => x.subject === subj);
    const bg = i % 2 === 0 ? '#FFFFFF' : '#F7F9FC';
    doc.rect(40, rowY, 515, 22).fill(bg).stroke('#DDDDDD');

    const gradeColor = !m ? '#888'
      : m.grade === 'A' ? '#2D7A4F'
      : m.grade === 'B' ? '#2A5FA0'
      : m.grade === 'C' ? '#B07A20'
      : '#C0392B';

    doc.fillColor('#333').fontSize(9.5).font('Helvetica');
    doc.text(subj, cols.subject, rowY + 7);

    if (m) {
      doc.text(m.midterm, cols.midterm, rowY + 7, { width: 55, align: 'center' });
      doc.text(m.assignment, cols.assign, rowY + 7, { width: 55, align: 'center' });
      doc.text(m.quiz_attendance, cols.quiz, rowY + 7, { width: 55, align: 'center' });
      doc.text(m.internal_total, cols.internal, rowY + 7, { width: 55, align: 'center' });
      doc.text(m.end_sem, cols.endSem, rowY + 7, { width: 55, align: 'center' });
      doc.text(m.final_total, cols.total, rowY + 7, { width: 55, align: 'center' });
      doc.fillColor(gradeColor).font('Helvetica-Bold').text(m.grade, cols.grade, rowY + 7);
      totalAll += m.final_total;
    } else {
      doc.fillColor('#AAA').text('—', cols.midterm, rowY + 7, { width: 55, align: 'center' });
      doc.text('—', cols.assign, rowY + 7, { width: 55, align: 'center' });
      doc.text('—', cols.quiz, rowY + 7, { width: 55, align: 'center' });
      doc.text('—', cols.internal, rowY + 7, { width: 55, align: 'center' });
      doc.text('—', cols.endSem, rowY + 7, { width: 55, align: 'center' });
      doc.text('—', cols.total, rowY + 7, { width: 55, align: 'center' });
      doc.text('N/A', cols.grade, rowY + 7);
    }
    rowY += 22;
  });

  // Summary row
  const avg = marks.length ? Math.round(totalAll / marks.length) : 0;
  const overallGrade = Mark.calcGrade(avg);
  doc.rect(40, rowY, 515, 26).fill('#1A3C5E');
  doc.fillColor('white').fontSize(10).font('Helvetica-Bold');
  doc.text('AGGREGATE', cols.subject, rowY + 8);
  doc.text(`Avg: ${avg}/100`, cols.total - 20, rowY + 8, { width: 80, align: 'center' });
  doc.text(overallGrade, cols.grade, rowY + 8);
  rowY += 26;

  // ── Grade Legend ──
  doc.moveDown(1.5);
  const legendY = rowY + 20;
  doc.rect(40, legendY, 515, 50).fill('#F8F7F4').stroke('#DDD');
  doc.fillColor('#333').fontSize(9).font('Helvetica-Bold').text('GRADE SCALE:', 55, legendY + 10);
  doc.font('Helvetica').fillColor('#2D7A4F').text('A: 90–100 (Outstanding)', 140, legendY + 10);
  doc.fillColor('#2A5FA0').text('B: 75–89 (Good)', 310, legendY + 10);
  doc.fillColor('#B07A20').text('C: 50–74 (Average)', 55, legendY + 28);
  doc.fillColor('#C0392B').text('D: Below 50 (Fail)', 200, legendY + 28);

  // ── At-Risk Notice ──
  const atRisk = marks.some(m => m.final_total < 40);
  if (atRisk) {
    doc.moveDown(1);
    doc.rect(40, legendY + 70, 515, 28).fill('#FDE8E8').stroke('#C0392B');
    doc.fillColor('#C0392B').fontSize(10).font('Helvetica-Bold')
      .text('⚠  AT-RISK: Student has scored below 40 in one or more subjects. Academic counseling recommended.', 55, legendY + 80, { width: 490 });
  }

  // ── Footer ──
  doc.rect(0, 790, 595, 51).fill('#F0F4F8');
  doc.fillColor('#888').fontSize(8).font('Helvetica')
    .text('OUTR Acadlytics — Automated Academic Report | Confidential | For Internal Use Only', 50, 800, { align: 'center' })
    .text('This report is system-generated and does not require a signature.', 50, 814, { align: 'center' });

  doc.end();
};

// @GET /api/reports/class — download all students summary as JSON (for frontend PDF)
exports.classReport = async (req, res) => {
  const students = await Student.find().sort({ regdNo: 1 });
  const report = [];

  for (const s of students) {
    const marks = await Mark.find({ studentId: s._id });
    const avg = marks.length
      ? Math.round(marks.reduce((sum, m) => sum + m.final_total, 0) / marks.length)
      : null;
    report.push({ name: s.name, regdNo: s.regdNo, marks, avg, grade: avg !== null ? Mark.calcGrade(avg) : 'N/A' });
  }

  res.json({ success: true, count: report.length, data: report });
};
