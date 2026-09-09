const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const asyncHandler = require('../utils/asyncHandler');

// Create Application
exports.createApplication = asyncHandler(async (req, res) => {
  if (req.user.role === 'student' && req.user.verificationStatus !== 'approved') {
    return res.status(403).json({ success: false, message: 'Your student account must be approved before applying' });
  }
  const { jobId, resume, coverLetter } = req.body;

  if (!jobId) {
    return res.status(400).json({ success: false, message: 'Please provide jobId' });
  }

  // Get student profile
  let studentProfile = await StudentProfile.findOne({ userId: req.user.id });
  if (!studentProfile) {
    studentProfile = await StudentProfile.create({
      userId: req.user.id,
    });
  }

  // Determine active resume
  const attachedResume = resume || studentProfile.resume;

  // Strict validation: Resume is REQUIRED to apply
  if (!attachedResume || attachedResume.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Resume required. Please upload your resume before submitting your job application.',
    });
  }

  // Get job details
  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  // Check for duplicate application
  const existingApplication = await Application.findOne({
    studentId: studentProfile._id,
    jobId,
  });

  if (existingApplication) {
    return res.status(409).json({
      success: false,
      message: 'You have already applied to this job',
    });
  }

  // Check eligibility
  if (job.minimumCGPA && studentProfile.cgpa < job.minimumCGPA) {
    return res.status(400).json({
      success: false,
      message: `Your CGPA (${studentProfile.cgpa}) does not meet the minimum requirement of ${job.minimumCGPA}`,
    });
  }

  if (job.maximumBacklogs !== undefined && studentProfile.backlogs > job.maximumBacklogs) {
    return res.status(400).json({
      success: false,
      message: `You have too many backlogs (${studentProfile.backlogs}). Maximum allowed: ${job.maximumBacklogs}`,
    });
  }

  const application = await Application.create({
    studentId: studentProfile._id,
    jobId,
    companyId: job.companyId,
    resume: attachedResume,
    coverLetter: coverLetter || '',
    status: 'Applied',
  });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully with attached resume',
    application,
  });
});

// Get All Applications (Admin/Recruiter)
exports.getAllApplications = asyncHandler(async (req, res) => {
  const { status, jobId } = req.query;

  let query = {};
  if (status) query.status = status;
  if (jobId) query.jobId = jobId;

  const applications = await Application.find(query)
    .populate('studentId')
    .populate('jobId')
    .populate('companyId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    applications,
  });
});

// Get Application by ID
exports.getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('studentId')
    .populate('jobId')
    .populate('companyId');

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  res.status(200).json({
    success: true,
    application,
  });
});

// Update Application Status
exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, interviewDate, interviewMode, interviewLocation, remarks } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Please provide status' });
  }

  const allowedTransitions = {
    Applied: ['Under Review', 'Rejected'],
    'Under Review': ['Shortlisted', 'Rejected'],
    Shortlisted: ['Interview Scheduled', 'Rejected'],
    'Interview Scheduled': ['Selected', 'Rejected'],
    Selected: [],
    Rejected: [],
  };
  const currentApplication = await Application.findById(req.params.id).select('status');
  if (!currentApplication) return res.status(404).json({ success: false, message: 'Application not found' });
  if (!allowedTransitions[currentApplication.status]?.includes(status)) {
    return res.status(400).json({ success: false, message: `Cannot move application from ${currentApplication.status} to ${status}` });
  }

  const application = await Application.findByIdAndUpdate(
    req.params.id,
    {
      status,
      interviewDate,
      interviewMode,
      interviewLocation,
      remarks,
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true }
  );

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Application status updated successfully',
    application,
  });
});

// Get Recruiter's Job Applications
exports.getRecruiterApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ companyId: req.query.companyId })
    .populate('studentId')
    .populate('jobId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    applications,
  });
});
