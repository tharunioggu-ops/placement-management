const express = require('express');
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  getRecruiterApplications,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('student'), createApplication);
router.get('/', protect, getAllApplications);
router.get('/:id', protect, getApplicationById);
router.put('/:id/status', protect, authorize('incharger', 'tpo'), updateApplicationStatus);
router.get('/recruiter/applications', protect, authorize('incharger', 'tpo'), getRecruiterApplications);

module.exports = router;
