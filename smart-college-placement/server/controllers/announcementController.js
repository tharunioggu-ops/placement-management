const Announcement = require('../models/Announcement');
const asyncHandler = require('../utils/asyncHandler');

// Create Announcement
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const { title, description, priority, targetAudience } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Please provide title and description' });
  }

  const announcement = await Announcement.create({
    title,
    description,
    createdBy: req.user.id,
    priority: priority || 'Medium',
    targetAudience: targetAudience || 'All',
  });

  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    announcement,
  });
});

// Get All Announcements
exports.getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find().populate('createdBy').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: announcements.length,
    announcements,
  });
});

// Update Announcement
exports.updateAnnouncement = asyncHandler(async (req, res) => {
  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  if (announcement.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this announcement' });
  }

  announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Announcement updated successfully',
    announcement,
  });
});

// Delete Announcement
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  if (announcement.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this announcement' });
  }

  await Announcement.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully',
  });
});
