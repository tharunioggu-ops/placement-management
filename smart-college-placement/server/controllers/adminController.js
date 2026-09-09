const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');
const { validatePassword } = require('../utils/validators');

// Get Admin Dashboard Stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalInchargers = await User.countDocuments({ role: 'incharger' });
  const totalCompanies = await Company.countDocuments();
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();
  const placedStudents = await StudentProfile.countDocuments({ placementStatus: 'Placed' });

  res.status(200).json({
    success: true,
    stats: {
      totalStudents,
      totalInchargers,
      totalCompanies,
      totalJobs,
      totalApplications,
      placedStudents,
    },
  });
});

// Get All Students (Admin)
exports.getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' });
  const studentProfiles = await StudentProfile.find().populate('userId');

  res.status(200).json({
    success: true,
    count: students.length,
    students: studentProfiles,
  });
});

// Update candidate placement status (Admin)
exports.updateCandidateStatus = asyncHandler(async (req, res) => {
  const { placementStatus } = req.body;
  if (!['Not Placed', 'Placed', 'Not Eligible'].includes(placementStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid placement status' });
  }

  const profile = await StudentProfile.findOneAndUpdate(
    { userId: req.params.id },
    { placementStatus },
    { new: true }
  ).populate('userId');

  if (!profile) return res.status(404).json({ success: false, message: 'Candidate not found' });
  res.status(200).json({ success: true, message: 'Candidate status updated', studentProfile: profile });
});

// Delete candidate and their applications (Admin)
exports.deleteCandidate = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.params.id });
  if (!profile) return res.status(404).json({ success: false, message: 'Candidate not found' });

  await Application.deleteMany({ studentId: profile._id });
  await StudentProfile.deleteOne({ _id: profile._id });
  await User.deleteOne({ _id: req.params.id, role: 'student' });
  res.status(200).json({ success: true, message: 'Candidate deleted successfully' });
});

// Get All Recruiters (Admin)
exports.getAllRecruiters = asyncHandler(async (req, res) => {
  const recruiters = await User.find({ role: 'incharger' });

  res.status(200).json({
    success: true,
    count: recruiters.length,
    recruiters,
  });
});

// TPO creates placement inchargers; there is no public incharger registration.
exports.createIncharger = asyncHandler(async (req, res) => {
  const { name, username, email, password, phone } = req.body;
  const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : `${normalizedUsername}@smartplacement.local`;

  if (!name || !normalizedUsername || !password) {
    return res.status(400).json({ success: false, message: 'Name, username, and password are required' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
  }
  if (await User.findOne({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] })) {
    return res.status(409).json({ success: false, message: 'An account with this username or email already exists' });
  }

  const incharger = await User.create({
    name: name.trim(), username: normalizedUsername, email: normalizedEmail,
    password, phone: phone || '', role: 'incharger', verificationStatus: 'approved', isActive: true,
  });
  res.status(201).json({ success: true, message: 'Placement incharge created successfully', incharger });
});

exports.getPlacementInchargers = asyncHandler(async (req, res) => {
  const inchargers = await User.find({ role: 'incharger' }).select('-password');
  res.status(200).json({ success: true, count: inchargers.length, inchargers });
});

exports.deletePlacementIncharger = asyncHandler(async (req, res) => {
  const incharger = await User.findOneAndDelete({ _id: req.params.id, role: 'incharger' });
  if (!incharger) {
    return res.status(404).json({ success: false, message: 'Placement incharge account not found' });
  }
  res.status(200).json({ success: true, message: 'Placement incharge deleted successfully.' });
});

exports.getPendingStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student', verificationStatus: 'pending' }).select('-password');
  const profiles = await StudentProfile.find({ userId: { $in: students.map((student) => student._id) } }).populate('userId');
  res.status(200).json({ success: true, count: profiles.length, students: profiles });
});

exports.updateStudentVerification = asyncHandler(async (req, res) => {
  const { verificationStatus } = req.body;
  if (!['approved', 'rejected'].includes(verificationStatus)) {
    return res.status(400).json({ success: false, message: 'Verification status must be approved or rejected' });
  }
  const student = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'student' },
    { verificationStatus },
    { new: true }
  ).select('-password');
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  res.status(200).json({ success: true, message: `Student ${verificationStatus}`, student });
});

exports.getPlacementOperations = asyncHandler(async (req, res) => {
  const [students, inchargers, applications, jobs] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'incharger', isActive: true }),
    Application.find().sort({ updatedAt: -1 }).limit(100).populate('studentId').populate('jobId').populate('companyId'),
    Job.find().sort({ createdAt: -1 }).limit(100).populate('companyId').populate('recruiterId'),
  ]);
  res.status(200).json({ success: true, operations: { students, inchargers, applications, jobs } });
});

// Verify Company
exports.verifyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  res.status(200).json({ success: true, message: 'Company verified successfully', company });
});

// Approve Job
exports.approveJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  res.status(200).json({ success: true, message: 'Job approved successfully', job });
});

// Reject Job
exports.rejectJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { status: 'Rejected' }, { new: true });

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  res.status(200).json({ success: true, message: 'Job rejected successfully', job });
});

// Get All Applications (Admin)
exports.getAllApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find()
    .populate('studentId')
    .populate('jobId')
    .populate('companyId');

  res.status(200).json({
    success: true,
    count: applications.length,
    applications,
  });
});

// Get Placement Analytics
exports.getPlacementAnalytics = asyncHandler(async (req, res) => {
  const placedStudents = await StudentProfile.countDocuments({ placementStatus: 'Placed' });
  const notPlacedStudents = await StudentProfile.countDocuments({ placementStatus: 'Not Placed' });
  const notEligibleStudents = await StudentProfile.countDocuments({ placementStatus: 'Not Eligible' });

  const departmentStats = await StudentProfile.aggregate([
    {
      $group: {
        _id: '$department',
        placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'Placed'] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    analytics: {
      placedStudents,
      notPlacedStudents,
      notEligibleStudents,
      departmentStats,
    },
  });
});

// ==========================================
// MONTHLY REPORTS (real aggregation from DB)
// ==========================================
exports.getMonthlyReports = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const year = parseInt(req.query.year) || currentYear;
  const month = req.query.month ? parseInt(req.query.month) : null; // 1-12 or null
  const { startDate: customStartDate, endDate: customEndDate } = req.query;

  // Date range for filtering
  let startDate, endDate;
  if (customStartDate && customEndDate) {
    startDate = new Date(customStartDate);
    endDate = new Date(customEndDate);
    endDate.setHours(23, 59, 59, 999);
  } else if (month) {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59);
  } else {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59);
  }

  // 1. Total jobs posted in range
  const totalJobsPosted = await Job.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
  });

  // Active jobs (not closed)
  const activeJobs = await Job.countDocuments({ status: { $ne: 'Closed' } });

  // 2. Application statistics in range
  const [
    totalApplications,
    applicationsSubmitted,
    shortlistedApplications,
    interviewCalls,
    selectedHired,
    rejectedApplications,
    activeApplications,
  ] = await Promise.all([
    Application.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
    Application.countDocuments({ status: 'Applied', createdAt: { $gte: startDate, $lte: endDate } }),
    Application.countDocuments({ status: 'Shortlisted', createdAt: { $gte: startDate, $lte: endDate } }),
    Application.countDocuments({
      $or: [{ status: 'Interview Scheduled' }, { interviewDate: { $exists: true, $ne: null } }],
      createdAt: { $gte: startDate, $lte: endDate },
    }),
    Application.countDocuments({ status: 'Selected', createdAt: { $gte: startDate, $lte: endDate } }),
    Application.countDocuments({ status: 'Rejected', createdAt: { $gte: startDate, $lte: endDate } }),
    Application.countDocuments({
      status: { $in: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled'] },
      createdAt: { $gte: startDate, $lte: endDate },
    }),
  ]);

  // Total vacancies (sum across companies)
  const vacancyAgg = await Company.aggregate([
    { $group: { _id: null, totalVacancies: { $sum: '$totalVacancies' } } },
  ]);
  const totalVacancies = vacancyAgg[0]?.totalVacancies || 0;

  // Total companies
  const totalCompanies = await Company.countDocuments();

  // Total hired from company monthly data
  const hiringAgg = await Company.aggregate([
    { $unwind: '$monthlyHiringData' },
    { $match: { 'monthlyHiringData.year': year } },
    ...(month ? [{ $match: { 'monthlyHiringData.month': new Date(year, month - 1).toLocaleString('en-US', { month: 'short' }) + ' ' + year } }] : []),
    { $group: { _id: null, totalHired: { $sum: '$monthlyHiringData.hired' } } },
  ]);
  const totalHired = hiringAgg[0]?.totalHired || 0;

  // Monthly breakdown for charts (all 12 months of the year)
  const monthlyBreakdown = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let m = 0; m < 12; m++) {
    const mStart = new Date(year, m, 1);
    const mEnd = new Date(year, m + 1, 0, 23, 59, 59);
    const mLabel = monthNames[m] + ' ' + year;

    const [mApps, mJobs, mShort, mInterviews, mSelect, mReject] = await Promise.all([
      Application.countDocuments({ createdAt: { $gte: mStart, $lte: mEnd } }),
      Job.countDocuments({ createdAt: { $gte: mStart, $lte: mEnd } }),
      Application.countDocuments({ status: 'Shortlisted', createdAt: { $gte: mStart, $lte: mEnd } }),
      Application.countDocuments({ status: 'Interview Scheduled', createdAt: { $gte: mStart, $lte: mEnd } }),
      Application.countDocuments({ status: 'Selected', createdAt: { $gte: mStart, $lte: mEnd } }),
      Application.countDocuments({ status: 'Rejected', createdAt: { $gte: mStart, $lte: mEnd } }),
    ]);

    // Get hiring count from company monthly data
    const mHiringAgg = await Company.aggregate([
      { $unwind: '$monthlyHiringData' },
      { $match: { 'monthlyHiringData.month': mLabel } },
      { $group: { _id: null, hired: { $sum: '$monthlyHiringData.hired' } } },
    ]);

    const compHired = mHiringAgg[0]?.hired || 0;
    monthlyBreakdown.push({
      month: monthNames[m],
      fullMonth: mLabel,
      applications: mApps,
      submitted: mApps,
      jobsPosted: mJobs,
      shortlisted: mShort,
      interviewCalls: mInterviews,
      selected: mSelect,
      rejected: mReject,
      hired: compHired,
    });
  }

  // Company-wise hiring comparison
  const companies = await Company.find().select('companyName');
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);
  const companyHiringComparison = await Promise.all(companies.map(async (company) => {
    const jobs = await Job.find({ companyId: company._id }).select('_id vacancies');
    const jobIds = jobs.map((job) => job._id);
    const selectedApplications = await Application.countDocuments({
      companyId: company._id,
      jobId: { $in: jobIds },
      status: 'Selected',
      createdAt: { $gte: yearStart, $lt: yearEnd },
    });
    return {
      companyName: company.companyName,
      totalHired: selectedApplications,
      yearHired: selectedApplications,
      totalVacancies: jobs.reduce((sum, job) => sum + (job.vacancies || 1), 0),
    };
  }));

  res.status(200).json({
    success: true,
    year,
    month: month || 'all',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    summary: {
      totalApplications,
      applicationsSubmitted,
      shortlistedApplications,
      interviewCalls,
      selectedHired,
      rejectedApplications,
      activeApplications,
      totalJobsPosted,
      activeJobs,
      totalVacancies,
      totalHired,
      totalCompanies,
    },
    monthlyBreakdown,
    companyHiringComparison,
  });
});

// ========================
// ADMIN COMPANY MANAGEMENT
// ========================
exports.getAllCompaniesAdmin = asyncHandler(async (req, res) => {
  const companies = await Company.find().populate('recruiterId', 'name email');
  const companiesWithJobs = await Promise.all(
    companies.map(async (c) => {
      const jobCount = await Job.countDocuments({ companyId: c._id, status: { $ne: 'Closed' } });
      const applicationCount = await Application.countDocuments({ companyId: c._id });
      return {
        ...c.toObject(),
        activeJobs: jobCount,
        totalApplications: applicationCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: companiesWithJobs.length,
    companies: companiesWithJobs,
  });
});

exports.updateCompanyAdmin = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  res.status(200).json({ success: true, message: 'Company updated successfully', company });
});

// =======================
// ADMIN USER MANAGEMENT
// =======================
exports.updateUserAdmin = asyncHandler(async (req, res) => {
  const { name, phone, location, bio, isActive, role } = req.body;

  const updateFields = {};
  if (name) updateFields.name = name;
  if (phone !== undefined) updateFields.phone = phone;
  if (location !== undefined) updateFields.location = location;
  if (bio !== undefined) updateFields.bio = bio;
  if (isActive !== undefined) updateFields.isActive = isActive;
  // Admins can change role too (carefully)
  if (role && ['student', 'incharger', 'tpo'].includes(role)) updateFields.role = role;

  const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      isActive: user.isActive,
    },
  });
});
