const express = require('express');
const {
  createDrive,
  getAllDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
} = require('../controllers/driveController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('tpo'));
router.get('/', getAllDrives);
router.get('/:id', getDriveById);
router.post('/', createDrive);
router.put('/:id', updateDrive);
router.delete('/:id', deleteDrive);

module.exports = router;
