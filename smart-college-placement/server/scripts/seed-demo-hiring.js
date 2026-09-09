require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

const demoCompanies = [
  { companyName: 'TCS', industry: 'Information Technology', location: 'Hyderabad', vacancies: 120, hired: 4 },
  { companyName: 'Infosys', industry: 'Information Technology', location: 'Bengaluru', vacancies: 150, hired: 5 },
  { companyName: 'Wipro', industry: 'Information Technology', location: 'Pune', vacancies: 100, hired: 3 },
  { companyName: 'Accenture', industry: 'Consulting and Technology', location: 'Mumbai', vacancies: 200, hired: 6 },
];

const statuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected'];

async function getDemoStudent(index) {
  const email = `demo.student.${index}@smartplacement.com`;
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: `Demo Student ${index}`,
      email,
      password: 'Demo@12345',
      role: 'student',
      verificationStatus: 'approved',
    });
  }

  let profile = await StudentProfile.findOne({ userId: user._id });
  if (!profile) profile = await StudentProfile.create({ userId: user._id, department: 'CSE', course: 'B.Tech', year: 4, cgpa: 8.2 });
  return profile;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const currentYear = new Date().getFullYear();
  let applicationsCreated = 0;
  let jobsCreated = 0;

  for (let companyIndex = 0; companyIndex < demoCompanies.length; companyIndex += 1) {
    const details = demoCompanies[companyIndex];
    let company = await Company.findOne({ companyName: new RegExp(`^${details.companyName}$`, 'i') });
    if (!company) {
      company = await Company.create({
        companyName: details.companyName,
        industry: details.industry,
        location: details.location,
        totalVacancies: details.vacancies,
        isVerified: true,
      });
    }

    let job = await Job.findOne({ companyId: company._id, title: 'Campus Software Engineer' });
    if (!job) {
      job = await Job.create({
        companyId: company._id,
        title: 'Campus Software Engineer',
        description: `Demo campus hiring opportunity for ${details.companyName}`,
        location: details.location,
        jobType: 'Full Time',
        workMode: 'Hybrid',
        salary: '8 LPA',
        vacancies: details.vacancies,
        requiredSkills: ['JavaScript', 'SQL', 'Problem Solving'],
        eligibleDepartments: ['CSE', 'ECE'],
        minimumCGPA: 7,
        maximumBacklogs: 0,
        applicationDeadline: new Date(currentYear, 11, 31),
        status: 'Approved',
      });
      jobsCreated += 1;
    }

    for (let applicationIndex = 0; applicationIndex < 8; applicationIndex += 1) {
      const student = await getDemoStudent(applicationIndex + 1);
      const status = applicationIndex < details.hired
        ? 'Selected'
        : statuses[(applicationIndex + companyIndex) % statuses.length];
      const createdAt = new Date(currentYear, applicationIndex % 12, 5 + companyIndex);
      const existing = await Application.findOne({ studentId: student._id, jobId: job._id });
      if (!existing) {
        await Application.create({
          studentId: student._id,
          jobId: job._id,
          companyId: company._id,
          resume: '/uploads/resumes/demo-resume.pdf',
          status,
          appliedAt: createdAt,
          createdAt,
          updatedAt: createdAt,
        });
        applicationsCreated += 1;
      }
    }
  }

  console.log(JSON.stringify({ success: true, companies: demoCompanies.length, jobsCreated, applicationsCreated }, null, 2));
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
