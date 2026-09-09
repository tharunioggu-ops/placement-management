const PlacementDrive = require('../models/PlacementDrive');
const asyncHandler = require('../utils/asyncHandler');

// Create Placement Drive
exports.createDrive = asyncHandler(async (req, res) => {
  const { companyId, jobId, title, description, date, time, venue, eligibleDepartments, minimumCGPA, status } =
    req.body;

  if (!companyId || !title || !date) {
    return res.status(400).json({ success: false, message: 'Please provide required fields' });
  }

  const drive = await PlacementDrive.create({
    companyId,
    jobId,
    title,
    description,
    date,
    time,
    venue,
    eligibleDepartments,
    minimumCGPA,
    status: status || 'Upcoming',
  });

  res.status(201).json({
    success: true,
    message: 'Placement drive created successfully',
    drive,
  });
});

// Get All Placement Drives
exports.getAllDrives = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = {};
  if (status) query.status = status;

  const drives = await PlacementDrive.find(query).populate('companyId').populate('jobId');

  res.status(200).json({
    success: true,
    count: drives.length,
    drives,
  });
});

// Get Drive by ID
exports.getDriveById = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findById(req.params.id).populate('companyId').populate('jobId');

  if (!drive) {
    return res.status(404).json({ success: false, message: 'Drive not found' });
  }

  res.status(200).json({
    success: true,
    drive,
  });
});

// Update Drive
exports.updateDrive = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!drive) {
    return res.status(404).json({ success: false, message: 'Drive not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Drive updated successfully',
    drive,
  });
});

// Delete Drive
exports.deleteDrive = asyncHandler(async (req, res) => {
  const drive = await PlacementDrive.findByIdAndDelete(req.params.id);

  if (!drive) {
    return res.status(404).json({ success: false, message: 'Drive not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Drive deleted successfully',
  });
});
