const express = require('express');
const {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentResume,
  getStudentResume,
  deleteStudentResume,
  getStudentApplications,
  getRecommendedJobs,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/profile', protect, authorize('student'), getStudentProfile);
router.put('/profile', protect, authorize('student'), updateStudentProfile);

// Resume upload, retrieval, and deletion
router.post(
  '/resume',
  protect,
  authorize('student'),
  uploadResume.single('resume'),
  uploadStudentResume
);
router.get('/resume', protect, authorize('student'), getStudentResume);
router.delete('/resume', protect, authorize('student'), deleteStudentResume);

router.get('/applications', protect, authorize('student'), getStudentApplications);
router.get('/recommended-jobs', protect, authorize('student'), getRecommendedJobs);

module.exports = router;
