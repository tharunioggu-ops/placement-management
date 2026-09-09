export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const isEligible = (student, job) => {
  if (!student || !job) return false;
  return student.cgpa >= job.minimumCGPA && student.backlogs <= job.maximumBacklogs;
};

export const getStatusColor = (status) => {
  const colors = {
    'Applied': 'bg-blue-100 text-blue-800',
    'Under Review': 'bg-yellow-100 text-yellow-800',
    'Shortlisted': 'bg-purple-100 text-purple-800',
    'Interview Scheduled': 'bg-indigo-100 text-indigo-800',
    'Selected': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Pending': 'bg-gray-100 text-gray-800',
    'Approved': 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const truncate = (str, length = 100) => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};
