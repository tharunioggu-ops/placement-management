const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const asyncHandler = require('../utils/asyncHandler');

// Public placement analytics sourced from current database records
exports.getPublicPlacementAnalytics = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const companyId = req.query.company && req.query.company !== 'all' ? req.query.company : null;
  const department = req.query.department && req.query.department !== 'all' ? req.query.department : null;
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);
  const companyQuery = companyId ? { companyId } : {};
  const jobQuery = companyId ? { companyId } : {};
  const departmentProfiles = department
    ? await StudentProfile.find({ department }).select('_id').lean()
    : null;
  const studentIdQuery = departmentProfiles ? { studentId: { $in: departmentProfiles.map((profile) => profile._id) } } : {};
  const applicationBaseQuery = { ...companyQuery, ...studentIdQuery, createdAt: { $gte: startDate, $lt: endDate } };

  const [totalStudents, totalCompanies, totalJobs, totalApplications, shortlisted, selected, eligibleStudents] = await Promise.all([
    department ? StudentProfile.countDocuments({ department }) : User.countDocuments({ role: 'student' }),
    Company.countDocuments(companyId ? { _id: companyId } : {}),
    Job.countDocuments({ ...jobQuery, createdAt: { $gte: startDate, $lt: endDate } }),
    Application.countDocuments(applicationBaseQuery),
    Application.countDocuments({ ...applicationBaseQuery, status: 'Shortlisted' }),
    Application.countDocuments({ ...applicationBaseQuery, status: 'Selected' }),
    department
      ? StudentProfile.countDocuments({ department, cgpa: { $exists: true, $gte: 0 } })
      : StudentProfile.countDocuments({ cgpa: { $exists: true, $gte: 0 } }),
  ]);

  const monthly = await Promise.all(Array.from({ length: 12 }, async (_, month) => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 1);
    const dateQuery = { createdAt: { $gte: monthStart, $lt: monthEnd } };
    const [applications, shortlistedCount, interviews, hires] = await Promise.all([
      Application.countDocuments({ ...companyQuery, ...studentIdQuery, ...dateQuery }),
      Application.countDocuments({ ...companyQuery, ...studentIdQuery, status: 'Shortlisted', ...dateQuery }),
      Application.countDocuments({ ...companyQuery, ...studentIdQuery, status: 'Interview Scheduled', ...dateQuery }),
      Application.countDocuments({ ...companyQuery, ...studentIdQuery, status: 'Selected', ...dateQuery }),
    ]);
    return { month: monthStart.toLocaleString('en-US', { month: 'short' }), applications, shortlisted: shortlistedCount, interviews, hires, placements: hires };
  }));

  const stageCounts = await Promise.all([
    Application.distinct('studentId', applicationBaseQuery),
    Application.distinct('studentId', { ...applicationBaseQuery, status: 'Shortlisted' }),
    Application.distinct('studentId', { ...applicationBaseQuery, status: 'Interview Scheduled' }),
    Application.distinct('studentId', { ...applicationBaseQuery, status: 'Selected' }),
  ]);

  const companies = await Company.find(companyId ? { _id: companyId } : {}).select('companyName logo location hiringCount').lean();
  const companyPerformance = await Promise.all(companies.map(async (company) => {
    const companyApplications = { companyId: company._id, ...studentIdQuery, createdAt: { $gte: startDate, $lt: endDate } };
    const [applications, companyShortlisted, companySelected, jobs] = await Promise.all([
      Application.countDocuments(companyApplications),
      Application.countDocuments({ ...companyApplications, status: 'Shortlisted' }),
      Application.countDocuments({ ...companyApplications, status: 'Selected' }),
      Job.find({ companyId: company._id }).select('salary').limit(1).lean(),
    ]);
    return {
      ...company,
      applications,
      shortlisted: companyShortlisted,
      selected: companySelected,
      placementPercentage: applications ? Math.round((companySelected / applications) * 100) : 0,
      averagePackage: jobs[0]?.salary || 'Not listed',
    };
  }));

  res.status(200).json({
    success: true,
    year,
    filters: { company: companyId || 'all', department: department || 'all' },
    summary: { totalStudents, totalCompanies, totalJobs, totalApplications, shortlisted, selected, placementRate: totalStudents ? Math.round((selected / totalStudents) * 100) : 0 },
    funnel: [
      { label: 'Registered', value: totalStudents },
      { label: 'Eligible', value: eligibleStudents },
      { label: 'Applied', value: stageCounts[0].length },
      { label: 'Shortlisted', value: stageCounts[1].length },
      { label: 'Interview', value: stageCounts[2].length },
      { label: 'Selected', value: stageCounts[3].length },
      { label: 'Placed', value: stageCounts[3].length },
    ],
    monthly,
    companies: companyPerformance,
  });
});

// Create Company
exports.createCompany = asyncHandler(async (req, res) => {
  const {
    companyName,
    logo,
    description,
    website,
    registrationLink,
    industry,
    location,
    email,
    phone,
    companySize,
    totalVacancies,
    jobLocations,
    workModes,
  } = req.body;

  if (!companyName) {
    return res.status(400).json({ success: false, message: 'Please provide company name' });
  }

  const normalizedCompanyName = companyName.trim();
  const companyExists = await Company.findOne({ companyName: new RegExp(`^${normalizedCompanyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
  if (companyExists) {
    return res.status(409).json({ success: false, message: 'Company already exists' });
  }

  const company = await Company.create({
    ...(req.user.id !== 'tpo-static' ? { recruiterId: req.user.id } : {}),
    companyName: normalizedCompanyName,
    logo,
    description,
    website,
    registrationLink,
    industry,
    location,
    email,
    phone,
    companySize,
    totalVacancies: totalVacancies || 0,
    jobLocations: jobLocations || [],
    workModes: workModes || ['On-site', 'Hybrid'],
    isVerified: false,
  });

  res.status(201).json({
    success: true,
    message: 'Company created successfully',
    company,
  });
});

// Get All Companies
exports.getAllCompanies = asyncHandler(async (req, res) => {
  const { verified, search } = req.query;

  let query = {};
  if (verified === 'true') query.isVerified = true;
  if (verified === 'false') query.isVerified = false;
  if (search) query.companyName = new RegExp(search, 'i');

  const companies = await Company.find(query).populate('recruiterId');

  res.status(200).json({
    success: true,
    count: companies.length,
    companies,
  });
});

// Get Company Vacancies List (Dynamic from database)
exports.getCompanyVacancies = asyncHandler(async (req, res) => {
  const companies = await Company.find().select(
    'companyName logo totalVacancies hiringCount industry location jobLocations workModes isVerified'
  );

  // Compute live job count for each company
  const enhancedCompanies = await Promise.all(
    companies.map(async (c) => {
      const activeJobsCount = await Job.countDocuments({
        companyId: c._id,
        status: { $ne: 'Closed' },
      });
      return {
        _id: c._id,
        companyName: c.companyName,
        logo: c.logo,
        totalVacancies: c.totalVacancies || 0,
        hiringCount: c.hiringCount || 0,
        jobsPosted: activeJobsCount,
        industry: c.industry,
        location: c.location,
        jobLocations: c.jobLocations || [],
        workModes: c.workModes || [],
        isVerified: c.isVerified,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: enhancedCompanies.length,
    companies: enhancedCompanies,
  });
});

// Get Monthly Hiring Analytics
exports.getHiringAnalytics = asyncHandler(async (req, res) => {
  const { company, period, jobRole } = req.query;
  const companyQuery = company && company !== 'All' && company !== 'all'
    ? { companyName: new RegExp(`^${company}$`, 'i') }
    : {};
  const companies = await Company.find(companyQuery);
  const currentYear = new Date().getFullYear();
  const monthsToShow = period === '6m' || period === '6months' ? 6 : 12;
  const startMonth = Math.max(0, new Date().getMonth() - monthsToShow + 1);
  const startDate = new Date(currentYear, startMonth, 1);
  const endDate = new Date(currentYear, new Date().getMonth() + 1, 1);
  const trends = Array.from({ length: monthsToShow }, (_, index) => {
    const date = new Date(currentYear, startMonth + index, 1);
    return { month: date.toLocaleString('en-US', { month: 'short' }), year: date.getFullYear(), totalHired: 0, byCompany: {} };
  });
  const companyTotals = await Promise.all(companies.map(async (comp) => {
    const jobs = await Job.find({ companyId: comp._id, ...(jobRole ? { title: new RegExp(jobRole, 'i') } : {}) }).select('_id vacancies');
    const applications = await Application.find({ companyId: comp._id, jobId: { $in: jobs.map((job) => job._id) }, status: 'Selected', createdAt: { $gte: startDate, $lt: endDate } }).select('createdAt');
    applications.forEach((application) => {
      const date = new Date(application.createdAt);
      const index = (date.getFullYear() - currentYear) * 12 + date.getMonth() - startMonth;
      if (trends[index]) {
        trends[index].totalHired += 1;
        trends[index].byCompany[comp.companyName] = (trends[index].byCompany[comp.companyName] || 0) + 1;
      }
    });
    return { name: comp.companyName, totalHired: applications.length, totalVacancies: jobs.reduce((sum, job) => sum + (job.vacancies || 1), 0) };
  }));
  const totalRecruited = trends.reduce((acc, curr) => acc + curr.totalHired, 0);

  // Identify peak hiring month
  let peakMonth = { month: 'N/A', count: 0 };
  trends.forEach((t) => {
    if (t.totalHired > peakMonth.count) {
      peakMonth = { month: t.month, count: t.totalHired };
    }
  });

  res.status(200).json({
    success: true,
    totalHired: totalRecruited,
    peakMonth,
    trends,
    companies: companyTotals,
  });
});

// Get Company by ID
exports.getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id).populate('recruiterId');

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  res.status(200).json({
    success: true,
    company,
  });
});

// Get Company Details & Job Statistics (Detailed View)
exports.getCompanyStats = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  // Find all jobs for this company
  const jobs = await Job.find({ companyId: company._id, status: { $ne: 'Closed' } });

  const totalVacancies = company.totalVacancies || jobs.reduce((acc, j) => acc + (j.vacancies || 1), 0);
  const totalHired = company.hiringCount || jobs.reduce((acc, j) => acc + (j.hiredCount || 0), 0);

  // Extract distinct locations and work modes
  const locations = company.jobLocations?.length > 0
    ? company.jobLocations
    : [...new Set(jobs.map((j) => j.location).filter(Boolean))];

  const workModes = company.workModes?.length > 0
    ? company.workModes
    : [...new Set(jobs.map((j) => j.workMode).filter(Boolean))];

  res.status(200).json({
    success: true,
    company: {
      _id: company._id,
      companyName: company.companyName,
      logo: company.logo,
      description: company.description,
      website: company.website,
      industry: company.industry,
      location: company.location,
      officeAddress: company.officeAddress || company.fullAddress || company.location || 'Corporate Headquarters',
      fullAddress: company.fullAddress || company.officeAddress || company.location,
      interviewVenue: company.interviewVenue || 'Main Placement Auditorium / Virtual Meeting Link',
      totalVacancies,
      jobsPosted: jobs.length,
      hiringCount: totalHired,
      monthlyHiringData: company.monthlyHiringData || [],
      jobLocations: locations,
      workModes: workModes,
      availableRoles: jobs.map((j) => ({
        _id: j._id,
        title: j.title,
        description: j.description,
        jobType: j.jobType,
        workMode: j.workMode,
        location: j.location,
        officeAddress: j.officeAddress || company.officeAddress || company.fullAddress || j.location,
        interviewVenue: j.interviewVenue || company.interviewVenue || 'Auditorium Hall / Online Assessment Center',
        salary: j.salary,
        vacancies: j.vacancies || 1,
        requiredSkills: j.requiredSkills || [],
        eligibleDepartments: j.eligibleDepartments || [],
        minimumCGPA: j.minimumCGPA || 0,
        maximumBacklogs: j.maximumBacklogs || 0,
        applicationDeadline: j.applicationDeadline,
      })),
    },
  });
});

// Update Company
exports.updateCompany = asyncHandler(async (req, res) => {
  let company = await Company.findById(req.params.id);

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  if (company.recruiterId && company.recruiterId.toString() !== req.user.id && req.user.role !== 'tpo') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this company' });
  }

  company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Company updated successfully',
    company,
  });
});

// Delete Company
exports.deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  if (company.recruiterId && company.recruiterId.toString() !== req.user.id && req.user.role !== 'tpo') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this company' });
  }

  await Company.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Company deleted successfully',
  });
});

// Get Recruiter's Company
exports.getRecruiterCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ recruiterId: req.user.id });

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  res.status(200).json({
    success: true,
    company,
  });
});

// Get Detailed Analytics for a Specific Company
exports.getCompanyDetailedAnalytics = asyncHandler(async (req, res) => {
  const { companyName } = req.params;
  const company = await Company.findOne({
    companyName: new RegExp(`^${companyName}$`, 'i'),
  });

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  const period = req.params.period || '12-months';
  const now = new Date();
  const months = period === '6-months' ? 6 : period === 'current-year' ? now.getMonth() + 1 : 12;
  const startDate = period === 'current-year'
    ? new Date(now.getFullYear(), 0, 1)
    : new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const jobs = await Job.find({ companyId: company._id, createdAt: { $gte: startDate, $lt: endDate } }).select('vacancies createdAt salary minimumCGPA');
  const applications = await Application.find({ companyId: company._id, createdAt: { $gte: startDate, $lt: endDate } }).select('status createdAt');
  const allJobs = await Job.find({ companyId: company._id }).select('vacancies salary minimumCGPA');
  const allApplications = await Application.find({ companyId: company._id }).select('status');
  const totalOpenings = allJobs.reduce((sum, job) => sum + (job.vacancies || 1), 0);
  const totalHired = allApplications.filter((application) => application.status === 'Selected').length;
  const totalApplications = applications.length;
  const totalShortlisted = applications.filter((a) => a.status === 'Shortlisted').length;
  const totalInterviews = applications.filter((a) => a.status === 'Interview Scheduled').length;
  const trends = Array.from({ length: months }, (_, index) => {
    const date = new Date(startDate.getFullYear(), startDate.getMonth() + index, 1);
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const jobsInMonth = jobs.filter((job) => job.createdAt >= date && job.createdAt < nextMonth);
    const applicationsInMonth = applications.filter((application) => application.createdAt >= date && application.createdAt < nextMonth);
    return {
      month: date.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      monthShort: date.toLocaleString('en-US', { month: 'short' }),
      jobOpenings: jobsInMonth.reduce((sum, job) => sum + (job.vacancies || 1), 0),
      applications: applicationsInMonth.length,
      shortlisted: applicationsInMonth.filter((application) => application.status === 'Shortlisted').length,
      interviewOpportunities: applicationsInMonth.filter((application) => application.status === 'Interview Scheduled').length,
      hired: applicationsInMonth.filter((application) => application.status === 'Selected').length,
    };
  });

  res.status(200).json({
    success: true,
    company: {
      _id: company._id,
      companyName: company.companyName,
      logo: company.logo,
      industry: company.industry,
      location: company.location,
      officeAddress: company.officeAddress || company.fullAddress || company.location,
      interviewVenue: company.interviewVenue || 'Campus Placement Auditorium / Virtual Meeting Room',
      totalOpenings,
      totalHired,
      totalApplications,
      totalShortlisted,
      totalInterviews,
      shortlistRate: totalApplications ? Math.round((totalShortlisted / totalApplications) * 100) : 0,
      hiringRate: totalApplications ? Math.round((totalHired / totalApplications) * 100) : 0,
    },
    trends,
  });
});

// Compare 2 to 4 Companies
exports.getCompaniesComparison = asyncHandler(async (req, res) => {
  const companiesParam = req.query.companies;
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = req.query.month && req.query.month !== 'all' ? Number(req.query.month) : null;
  const jobRole = typeof req.query.jobRole === 'string' ? req.query.jobRole.trim() : '';
  let companyNames = [];
  if (Array.isArray(companiesParam)) {
    companyNames = companiesParam;
  } else if (typeof companiesParam === 'string') {
    companyNames = companiesParam.split(',').map((s) => s.trim()).filter(Boolean);
  }

  companyNames = companyNames.slice(0, 4);

  const companyQuery = companyNames.length
    ? { companyName: { $in: companyNames.map((name) => new RegExp(`^${name}$`, 'i')) } }
    : {};
  const companies = await Company.find(companyQuery).sort({ companyName: 1 });
  const startDate = new Date(year, month ? month - 1 : 0, 1);
  const endDate = month ? new Date(year, month, 1) : new Date(year + 1, 0, 1);

  const comparisonData = await Promise.all(
    companies.map(async (c) => {
      const jobQuery = { companyId: c._id, ...(jobRole ? { title: new RegExp(jobRole, 'i') } : {}) };
      const jobs = await Job.find(jobQuery).select('_id vacancies minimumCGPA salary title');
      const jobIds = jobs.map((job) => job._id);
      const applicationQuery = {
        companyId: c._id,
        ...(jobIds.length ? { jobId: { $in: jobIds } } : { jobId: null }),
        createdAt: { $gte: startDate, $lt: endDate },
      };
      const applications = await Application.find(applicationQuery).select('status createdAt');
      const totalVacancies = jobs.reduce((sum, job) => sum + (job.vacancies || 1), 0);
      const totalHired = applications.filter((application) => application.status === 'Selected').length;
      const totalApps = applications.length;
      const totalShortlisted = applications.filter((a) => a.status === 'Shortlisted').length;
      const minCGPAs = jobs.map((j) => j.minimumCGPA).filter(Boolean);
      const lowestCGPA = minCGPAs.length > 0 ? Math.min(...minCGPAs) : null;

      return {
        _id: c._id,
        companyName: c.companyName,
        logo: c.logo,
        industry: c.industry,
        location: c.location,
        officeAddress: c.officeAddress || c.fullAddress || c.location,
        interviewVenue: c.interviewVenue,
        totalVacancies,
        totalHired,
        totalApplications: totalApps,
        totalShortlisted,
        minimumCGPA: lowestCGPA,
        topPackage: jobs.length > 0 ? jobs[0].salary : null,
        workModes: c.workModes || [],
        monthlyData: Array.from({ length: 12 }, (_, index) => ({
          month: new Date(year, index, 1).toLocaleString('en-US', { month: 'short' }),
          hired: applications.filter((application) => {
            const date = new Date(application.createdAt);
            return date.getMonth() === index;
          }).filter((application) => application.status === 'Selected').length,
        })),
      };
    })
  );

  // Grouped metrics comparison for Bar Charts
  const metricsComparison = [
    {
      metric: 'Job Openings',
      ...Object.fromEntries(comparisonData.map((c) => [c.companyName, c.totalVacancies])),
    },
    {
      metric: 'Applications',
      ...Object.fromEntries(comparisonData.map((c) => [c.companyName, c.totalApplications])),
    },
    {
      metric: 'Shortlisted',
      ...Object.fromEntries(comparisonData.map((c) => [c.companyName, c.totalShortlisted])),
    },
    {
      metric: 'Hired Candidates',
      ...Object.fromEntries(comparisonData.map((c) => [c.companyName, c.totalHired])),
    },
  ];

  // Months timeline comparison for Multi-Line/Area charts
  const monthLabels = comparisonData.length ? comparisonData[0].monthlyData.map((d) => d.month) : [];
  const hiringTrendsComparison = monthLabels.map((m) => {
    const point = { month: m.split(' ')[0], fullMonth: m };
    comparisonData.forEach((c) => {
      const match = c.monthlyData.find((d) => d.month === m);
      if (match) point[c.companyName] = match.hired;
    });
    return point;
  });

  res.status(200).json({
    success: true,
    companies: comparisonData,
    metricsComparison,
    hiringTrendsComparison,
  });
});
