const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    title: {
      type: String,
      required: [true, 'Please provide job title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    officeAddress: {
      type: String,
      default: '',
    },
    interviewVenue: {
      type: String,
      default: '',
    },
    jobType: {
      type: String,
      enum: ['Full Time', 'Internship', 'Part Time'],
      default: 'Full Time',
    },
    workMode: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'Hybrid',
    },
    salary: {
      type: String,
      default: 'Negotiable',
    },
    experience: {
      type: String,
      default: '0',
    },
    vacancies: {
      type: Number,
      default: 1,
    },
    hiredCount: {
      type: Number,
      default: 0,
    },
    requiredSkills: [String],
    eligibleDepartments: [String],
    minimumCGPA: {
      type: Number,
      default: 0,
    },
    maximumBacklogs: {
      type: Number,
      default: 0,
    },
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Closed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
