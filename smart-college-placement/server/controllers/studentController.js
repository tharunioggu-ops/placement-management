const path = require('path');
const fs = require('fs');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const asyncHandler = require('../utils/asyncHandler');
const { validateCGPA } = require('../utils/validators');

// Get Student Profile
exports.getStudentProfile = asyncHandler(async (req, res) => {
  let studentProfile = await StudentProfile.findOne({ userId: req.user.id }).populate('userId');

  if (!studentProfile) {
    studentProfile = await StudentProfile.create({
      userId: req.user.id,
    });
    studentProfile = await StudentProfile.findById(studentProfile._id).populate('userId');
  }

  res.status(200).json({
    success: true,
    studentProfile,
  });
});

// Update Student Profile
exports.updateStudentProfile = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    location,
    bio,
    department,
    course,
    year,
    semester,
    dateOfBirth,
    gender,
    address,
    city,
    cgpa,
    tenthPercentage,
    intermediatePercentage,
    education,
    skills,
    technicalSkills,
    certifications,
    projects,
    internships,
    resume,
    backlogs,
  } = req.body;

  // Validate CGPA if passed directly
  if (cgpa !== undefined && cgpa !== null && cgpa !== '' && !validateCGPA(cgpa)) {
    return res.status(400).json({ success: false, message: 'CGPA must be between 0 and 10' });
  }

  // Update user model if personal fields were provided
  const userUpdate = {};
  if (name && name.trim()) userUpdate.name = name.trim();
  if (phone !== undefined) userUpdate.phone = phone;
  if (location !== undefined) userUpdate.location = location;
  if (bio !== undefined) userUpdate.bio = bio;

  if (Object.keys(userUpdate).length > 0) {
    await User.findByIdAndUpdate(req.user.id, userUpdate, { new: true, runValidators: true });
  }

  // Calculate backlogs count from education list if present
  let computedBacklogs = backlogs !== undefined ? Number(backlogs) : 0;
  if (Array.isArray(education)) {
    const hasBacklogItem = education.some((e) => e.hasBacklogs === 'Yes' || e.hasBacklogs === true);
    if (hasBacklogItem) {
      computedBacklogs = education.reduce((acc, curr) => {
        if (curr.hasBacklogs === 'Yes' || curr.hasBacklogs === true) {
          return acc + (Number(curr.backlogsCount) || 1);
        }
        return acc;
      }, 0);
    } else if (backlogs === undefined) {
      computedBacklogs = 0;
    }
  }

  const profileUpdateData = {
    backlogs: computedBacklogs,
  };

  if (department !== undefined) profileUpdateData.department = department;
  if (course !== undefined) profileUpdateData.course = course;
  if (year !== undefined) profileUpdateData.year = year;
  if (semester !== undefined) profileUpdateData.semester = semester;
  if (dateOfBirth !== undefined) profileUpdateData.dateOfBirth = dateOfBirth;
  if (gender !== undefined) profileUpdateData.gender = gender;
  if (phone !== undefined) profileUpdateData.phone = phone;
  if (address !== undefined) profileUpdateData.address = address;
  if (city !== undefined) profileUpdateData.city = city;
  if (cgpa !== undefined && cgpa !== '') profileUpdateData.cgpa = Number(cgpa);
  if (tenthPercentage !== undefined && tenthPercentage !== '') profileUpdateData.tenthPercentage = Number(tenthPercentage);
  if (intermediatePercentage !== undefined && intermediatePercentage !== '') profileUpdateData.intermediatePercentage = Number(intermediatePercentage);
  if (Array.isArray(education)) profileUpdateData.education = education;
  if (Array.isArray(skills)) profileUpdateData.skills = skills;
  if (Array.isArray(technicalSkills)) profileUpdateData.technicalSkills = technicalSkills;
  if (Array.isArray(certifications)) profileUpdateData.certifications = certifications;
  if (Array.isArray(projects)) profileUpdateData.projects = projects;
  if (Array.isArray(internships)) profileUpdateData.internships = internships;
  if (resume !== undefined) profileUpdateData.resume = resume;

  let studentProfile = await StudentProfile.findOneAndUpdate(
    { userId: req.user.id },
    profileUpdateData,
    { new: true, runValidators: true, upsert: true }
  ).populate('userId');

  const updatedUser = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    studentProfile,
    user: updatedUser,
  });
});

// Upload or Replace Resume
exports.uploadStudentResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a resume file (.pdf, .doc, .docx up to 10MB)',
    });
  }

  let studentProfile = await StudentProfile.findOne({ userId: req.user.id });

  if (!studentProfile) {
    studentProfile = await StudentProfile.create({
      userId: req.user.id,
      department: 'CSE',
      course: 'B.Tech',
    });
  }

  // Delete previous resume file if it exists locally
  if (studentProfile.resume && studentProfile.resume.startsWith('/uploads/resumes/')) {
    const oldPath = path.join(__dirname, '..', studentProfile.resume);
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.warn('Could not delete old resume file:', err.message);
      }
    }
  }

  const resumeRelativeUrl = `/uploads/resumes/${req.file.filename}`;

  studentProfile.resume = resumeRelativeUrl;
  studentProfile.resumeOriginalName = req.file.originalname;
  studentProfile.resumeMimeType = req.file.mimetype;
  studentProfile.resumeSize = req.file.size;
  studentProfile.resumeUpdatedAt = new Date();

  await studentProfile.save();

  res.status(200).json({
    success: true,
    message: 'Resume uploaded successfully',
    resume: {
      url: resumeRelativeUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      updatedAt: studentProfile.resumeUpdatedAt,
    },
    studentProfile,
  });
});

// Get Student Resume details
exports.getStudentResume = asyncHandler(async (req, res) => {
  const studentProfile = await StudentProfile.findOne({ userId: req.user.id });

  if (!studentProfile || !studentProfile.resume) {
    return res.status(200).json({
      success: true,
      hasResume: false,
      resume: null,
    });
  }

  res.status(200).json({
    success: true,
    hasResume: true,
    resume: {
      url: studentProfile.resume,
      originalName: studentProfile.resumeOriginalName || path.basename(studentProfile.resume),
      size: studentProfile.resumeSize || 0,
      mimeType: studentProfile.resumeMimeType || 'application/pdf',
      updatedAt: studentProfile.resumeUpdatedAt || studentProfile.updatedAt,
    },
  });
});

// Delete Student Resume
exports.deleteStudentResume = asyncHandler(async (req, res) => {
  const studentProfile = await StudentProfile.findOne({ userId: req.user.id });

  if (!studentProfile) {
    return res.status(404).json({ success: false, message: 'Student profile not found' });
  }

  if (studentProfile.resume && studentProfile.resume.startsWith('/uploads/resumes/')) {
    const filePath = path.join(__dirname, '..', studentProfile.resume);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not delete resume file:', err.message);
      }
    }
  }

  studentProfile.resume = '';
  studentProfile.resumeOriginalName = '';
  studentProfile.resumeMimeType = '';
  studentProfile.resumeSize = 0;
  studentProfile.resumeUpdatedAt = null;

  await studentProfile.save();

  res.status(200).json({
    success: true,
    message: 'Resume removed successfully',
  });
});

// Get Student Applications
exports.getStudentApplications = asyncHandler(async (req, res) => {
  const studentProfile = await StudentProfile.findOne({ userId: req.user.id });

  if (!studentProfile) {
    return res.status(200).json({ success: true, applications: [] });
  }

  const applications = await Application.find({
    $or: [{ studentId: studentProfile._id }, { studentId: req.user.id }],
  })
    .populate('jobId')
    .populate('companyId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    applications,
  });
});

// Get Recommended Jobs
exports.getRecommendedJobs = asyncHandler(async (req, res) => {
  const studentProfile = await StudentProfile.findOne({ userId: req.user.id });

  if (!studentProfile) {
    return res.status(404).json({ success: false, message: 'Student profile not found' });
  }

  const { location, jobType, workMode } = req.query;
  const query = { status: 'Approved' };

  if (studentProfile.department && studentProfile.cgpa !== undefined && studentProfile.cgpa !== null) {
    query.eligibleDepartments = studentProfile.department;
    query.minimumCGPA = { $lte: studentProfile.cgpa };
    query.maximumBacklogs = { $gte: studentProfile.backlogs || 0 };
  } else {
    return res.status(200).json({ success: true, jobs: [] });
  }

  if (location) query.location = new RegExp(location, 'i');
  if (jobType) query.jobType = jobType;
  if (workMode) query.workMode = workMode;

  const recommendedJobs = await Job.find(query)
    .populate('companyId')
    .populate('recruiterId');

  res.status(200).json({
    success: true,
    jobs: recommendedJobs,
  });
});
