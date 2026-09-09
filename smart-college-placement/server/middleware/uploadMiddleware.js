const multer = require('multer');
const os = require('os');
const path = require('path');
const fs = require('fs');

const uploadRootDir = process.env.UPLOAD_DIR
  || (process.env.VERCEL ? path.join(os.tmpdir(), 'smart-college-placement', 'uploads') : path.join(__dirname, '../uploads'));
fs.mkdirSync(uploadRootDir, { recursive: true });

// --- Resume Upload Configuration ---
const resumeUploadDir = path.join(uploadRootDir, 'resumes');
fs.mkdirSync(resumeUploadDir, { recursive: true });

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumeUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

const resumeFileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ];
  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are permitted.'));
  }
};

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: resumeFileFilter,
});

// --- Profile Image Upload Configuration ---
const profileImageDir = path.join(uploadRootDir, 'profiles');
fs.mkdirSync(profileImageDir, { recursive: true });

const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileImageDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const profileImageFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and GIF images are permitted.'));
  }
};

const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: profileImageFilter,
});

module.exports = {
  uploadResume,
  uploadProfileImage,
  uploadRootDir,
  uploadDir: resumeUploadDir,
  profileImageDir,
};
