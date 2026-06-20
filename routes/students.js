const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getStudents, getStudent, createStudent,
  updateStudent, deleteStudent, importStudents
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(protect);

router.route('/')
  .get(getStudents)
  .post(authorize('admin'), createStudent);

router.post('/import', authorize('admin'), upload.single('file'), importStudents);

router.route('/:id')
  .get(getStudent)
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

module.exports = router;
