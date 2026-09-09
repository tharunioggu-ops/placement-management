const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

const validateCGPA = (cgpa) => {
  return cgpa >= 0 && cgpa <= 10;
};

const validatePassword = (password) => {
  return typeof password === 'string' && password.length >= 4;
};

module.exports = {
  validateEmail,
  validatePhone,
  validateCGPA,
  validatePassword,
};
