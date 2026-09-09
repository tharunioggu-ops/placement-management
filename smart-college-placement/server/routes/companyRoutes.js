const express = require('express');
const {
  createCompany,
  getAllCompanies,
  getCompanyVacancies,
  getHiringAnalytics,
  getCompanyDetailedAnalytics,
  getCompaniesComparison,
  getCompanyById,
  getCompanyStats,
  updateCompany,
  deleteCompany,
  getRecruiterCompany,
  getPublicPlacementAnalytics,
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Specific routes before param :id
router.get('/vacancies', getCompanyVacancies);
router.get('/analytics/hiring', getHiringAnalytics);
router.get('/analytics/public', getPublicPlacementAnalytics);
router.get('/analytics/compare', getCompaniesComparison);
router.get('/analytics/company/:companyName/:period', getCompanyDetailedAnalytics);
router.get('/analytics/company/:companyName', getCompanyDetailedAnalytics);
router.get('/recruiter/company', getRecruiterCompany);

router.get('/', getAllCompanies);
router.get('/:id/stats', getCompanyStats);
router.get('/:id', getCompanyById);

router.post('/', authorize('tpo', 'incharger'), createCompany);
router.put('/:id', authorize('tpo', 'incharger'), updateCompany);
router.delete('/:id', authorize('tpo', 'incharger'), deleteCompany);

module.exports = router;
