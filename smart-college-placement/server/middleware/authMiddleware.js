const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No authorization token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id === 'tpo-static' && decoded.role === 'tpo') {
      req.user = { id: 'tpo-static', role: 'tpo', isActive: true };
    } else {
      req.user = await User.findById(decoded.id);
    }

    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (decoded.sessionVersion !== undefined && decoded.sessionVersion !== req.user.sessionVersion) {
      return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized to access this route', error: error.message });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
