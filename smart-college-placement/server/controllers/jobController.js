const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');

// Create Job
exports.createJob = asyncHandler(async (req, res) => {
  const {
    companyId,
    title,
    description,
    location,
    jobType,
    workMode,
    salary,
    experience,
    requiredSkills,
    eligibleDepartments,
    minimumCGPA,
    maximumBacklogs,
    applicationDeadline,
  } = req.body;

  if (!title || !companyId) {
    return res.status(400).json({ success: false, message: 'Please provide title and companyId' });
  }

  const company = await Company.findById(companyId).select('_id');
  if (!company) {
    return res.status(404).json({ success: false, message: 'Selected company not found' });
  }

  const job = await Job.create({
    companyId,
    ...(req.user.id !== 'tpo-static' ? { recruiterId: req.user.id } : {}),
    title,
    description,
    location,
    jobType,
    workMode,
    salary,
    experience,
    requiredSkills,
    eligibleDepartments,
    minimumCGPA,
    maximumBacklogs,
    applicationDeadline,
    status: req.user.role === 'tpo' ? 'Approved' : 'Pending',
  });

  res.status(201).json({
    success: true,
    message: 'Job posted successfully',
    job,
  });
});

// Get All Jobs (with filters)
exports.getAllJobs = asyncHandler(async (req, res) => {
  const { status, jobType, location, department } = req.query;

  let query = {};
  query.status = status || 'Approved';
  if (jobType) query.jobType = jobType;
  if (location) query.location = new RegExp(location, 'i');
  if (department) query.eligibleDepartments = department;

  const jobs = await Job.find(query).populate('companyId').populate('recruiterId');

  res.status(200).json({
    success: true,
    count: jobs.length,
    jobs,
  });
});

// Get Single Job
exports.getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('companyId').populate('recruiterId');

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  res.status(200).json({
    success: true,
    job,
  });
});

// Update Job
exports.updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  if (req.user.role !== 'tpo' && job.recruiterId?.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  res.status(200).json({
    success: true,
    message: 'Job updated successfully',
    job,
  });
});

// Delete Job
exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  if (req.user.role !== 'tpo' && job.recruiterId?.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
  }

  await Job.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Job deleted successfully',
  });
});

// Get Recruiter's Jobs
exports.getRecruiterJobs = asyncHandler(async (req, res) => {
  const query = req.user.role === 'tpo' ? {} : { recruiterId: req.user.id };
  const jobs = await Job.find(query).populate('companyId').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: jobs.length,
    jobs,
  });
});
