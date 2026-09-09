const jwt = require('jsonwebtoken');

const generateToken = (id, role, sessionVersion) => {
  return jwt.sign({ id, role, ...(sessionVersion !== undefined ? { sessionVersion } : {}) }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = generateToken;
