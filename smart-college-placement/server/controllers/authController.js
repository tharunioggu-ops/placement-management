const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const { validateEmail, validatePassword } = require('../utils/validators');

// Register User
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone = '', role = 'student' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
  }

  const normalizedRole = 'student';
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'A user with this email already exists' });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: phone || '',
    role: normalizedRole,
  });

  const token = generateToken(user._id, user.role, user.sessionVersion);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      location: user.location,
      bio: user.bio,
      verificationStatus: user.verificationStatus,
    },
  });
});

// Login User
exports.login = asyncHandler(async (req, res) => {
  const { email, username, identifier, password } = req.body;
  const rawIdentifier = identifier || email || username;
  const normalizedIdentifier = typeof rawIdentifier === 'string' ? rawIdentifier.trim().toLowerCase() : rawIdentifier;

  if (!normalizedIdentifier || !password) {
    return res.status(400).json({ success: false, message: 'Please provide username/email and password' });
  }

  const tpoEmail = (process.env.TPO_EMAIL || 'tpo@smartplacement.com').toLowerCase();
  const tpoPassword = process.env.TPO_PASSWORD || 'TPO@12345';

  if (normalizedIdentifier === tpoEmail && password === tpoPassword) {
    return res.status(200).json({
      success: true,
      message: 'TPO login successful',
      token: generateToken('tpo-static', 'tpo'),
      user: {
        id: 'tpo-static',
        name: 'Training and Placement Officer',
        email: tpoEmail,
        username: 'tpo',
        role: 'tpo',
        phone: '',
        profileImage: '',
        location: '',
        bio: '',
        verificationStatus: 'approved',
      },
    });
  }

  const lookup = normalizedIdentifier.includes('@')
    ? { email: normalizedIdentifier }
    : { username: normalizedIdentifier };
  const user = await User.findOne(lookup).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!['student', 'incharger', 'tpo'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'This account is not allowed to sign in here' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'User account is inactive' });
  }

  const token = generateToken(user._id, user.role, user.sessionVersion);

  res.status(200).json({
    success: true,
    message: user.role === 'student' && user.verificationStatus !== 'approved'
      ? 'Login successful. Complete your academic profile while approval is pending.'
      : 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      location: user.location,
      bio: user.bio,
      verificationStatus: user.verificationStatus,
    },
  });
});

// Logout User
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// Get Current User Profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      location: user.location,
      bio: user.bio,
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt,
    },
  });
});

// Update User Profile (name, phone, location, bio)
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, location, bio } = req.body;

  const updateFields = {};
  if (name && name.trim()) updateFields.name = name.trim();
  if (phone !== undefined) updateFields.phone = phone;
  if (location !== undefined) updateFields.location = location;
  if (bio !== undefined) updateFields.bio = bio;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateFields,
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      location: user.location,
      bio: user.bio,
    },
  });
});

// Upload Profile Image
exports.updateProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please provide an image file (JPG, PNG, or WEBP)' });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Delete old profile image if it exists on disk
  if (user.profileImage && user.profileImage.startsWith('/uploads/profiles/')) {
    const oldPath = path.join(__dirname, '..', user.profileImage);
    if (fs.existsSync(oldPath)) {
      try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
    }
  }

  const imageRelativeUrl = `/uploads/profiles/${req.file.filename}`;
  user.profileImage = imageRelativeUrl;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile image updated successfully',
    profileImage: imageRelativeUrl,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: imageRelativeUrl,
      location: user.location,
      bio: user.bio,
    },
  });
});
