const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    companyName: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    registrationLink: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    // Structured location fields
    city: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: 'India',
    },
    fullAddress: {
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
    email: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    companySize: {
      type: String,
      enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'],
      default: 'Enterprise',
    },
    totalVacancies: {
      type: Number,
      default: 0,
    },
    hiringCount: {
      type: Number,
      default: 0,
    },
    monthlyHiringData: [
      {
        month: { type: String, required: true },
        hired: { type: Number, default: 0 },
        year: { type: Number, default: 2026 },
      },
    ],
    jobLocations: {
      type: [String],
      default: [],
    },
    workModes: {
      type: [String],
      default: ['On-site', 'Hybrid', 'Remote'],
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
