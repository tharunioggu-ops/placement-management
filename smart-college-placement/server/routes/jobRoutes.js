const express = require('express');
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getRecruiterJobs,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getAllJobs);
router.get('/recruiter/my-jobs', getRecruiterJobs);
router.get('/:id', getJobById);
router.post('/', authorize('tpo', 'incharger'), createJob);
router.put('/:id', authorize('tpo', 'incharger'), updateJob);
router.delete('/:id', authorize('tpo', 'incharger'), deleteJob);

module.exports = router;
