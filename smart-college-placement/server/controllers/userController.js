const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const asyncHandler = require('../utils/asyncHandler');

// Get User Profile
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update User Profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, profileImage } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, profileImage },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user,
  });
});
