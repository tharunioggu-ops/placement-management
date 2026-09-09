const express = require('express');
const { aiChat, resumeAnalysis, interviewPreparation, jobRecommendation } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/chat', protect, authorize('student'), aiChat);
router.post('/resume-analysis', protect, authorize('student'), resumeAnalysis);
router.post('/interview-preparation', protect, authorize('student'), interviewPreparation);
router.post('/job-recommendation', protect, authorize('student'), jobRecommendation);

module.exports = router;
