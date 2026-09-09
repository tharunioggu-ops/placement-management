const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    college: String,
    graduationYear: Number,
    preferredJobRole: String,
    preferredLocation: String,
    department: {
      type: String,
      enum: ['CSE', 'ECE', 'ME', 'EEE', 'CIVIL', 'Other'],
    },
    course: {
      type: String,
      enum: ['B.Tech', 'B.E', 'B.Sc', 'BCA', 'MCA', 'M.Tech', 'MBA'],
    },
    year: {
      type: Number,
      enum: [1, 2, 3, 4],
    },
    semester: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    phone: String,
    address: String,
    city: String,
    cgpa: {
      type: Number,
    },
    tenthPercentage: {
      type: Number,
    },
    intermediatePercentage: {
      type: Number,
    },
    education: [
      {
        qualification: { type: String, required: true },
        institutionName: { type: String, required: true },
        passingYear: { type: String, required: true },
        percentageOrCgpa: { type: String, required: true },
        hasBacklogs: { type: String, enum: ['Yes', 'No'], default: 'No' },
        backlogsCount: { type: Number, default: 0 },
      },
    ],
    skills: [String],
    technicalSkills: [String],
    certifications: [String],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String,
      },
    ],
    internships: [
      {
        company: String,
        position: String,
        duration: String,
        description: String,
      },
    ],
    resume: {
      type: String, // Store resume file path or URL
      default: '',
    },
    resumeOriginalName: {
      type: String,
      default: '',
    },
    resumeMimeType: {
      type: String,
      default: '',
    },
    resumeSize: {
      type: Number,
      default: 0,
    },
    resumeUpdatedAt: {
      type: Date,
    },
    backlogs: {
      type: Number,
    },
    placementStatus: {
      type: String,
      enum: ['Not Placed', 'Placed', 'Not Eligible'],
      default: 'Not Placed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
