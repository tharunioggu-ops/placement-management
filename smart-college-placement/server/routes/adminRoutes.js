const express = require('express');
const {
  getDashboardStats,
  getAllStudents,
  updateCandidateStatus,
  deleteCandidate,
  getAllRecruiters,
  verifyCompany,
  approveJob,
  rejectJob,
  getAllApplications,
  getPlacementAnalytics,
  getMonthlyReports,
  getAllCompaniesAdmin,
  updateCompanyAdmin,
  updateUserAdmin,
  createIncharger,
  getPlacementInchargers,
  deletePlacementIncharger,
  getPendingStudents,
  updateStudentVerification,
  getPlacementOperations,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Monthly Reports accessible by authenticated students and TPO only
router.get('/reports/monthly', protect, getMonthlyReports);

router.use(protect, authorize('tpo'));

router.get('/dashboard', getDashboardStats);
router.get('/students', getAllStudents);
router.put('/candidates/:id/status', updateCandidateStatus);
router.delete('/candidates/:id', deleteCandidate);
router.get('/recruiters', getAllRecruiters);
router.get('/inchargers', getPlacementInchargers);
router.post('/inchargers', authorize('tpo'), createIncharger);
router.delete('/inchargers/:id', authorize('tpo'), deletePlacementIncharger);
router.get('/students/pending', getPendingStudents);
router.put('/students/:id/verification', updateStudentVerification);
router.get('/operations', getPlacementOperations);
router.get('/applications', getAllApplications);
router.get('/analytics', getPlacementAnalytics);

// Company Admin Management
router.get('/companies', getAllCompaniesAdmin);
router.put('/companies/:id', updateCompanyAdmin);
router.put('/companies/:id/verify', verifyCompany);

// Job Management
router.put('/jobs/:id/approve', approveJob);
router.put('/jobs/:id/reject', rejectJob);

// User Management
router.put('/users/:id', updateUserAdmin);

module.exports = router;
