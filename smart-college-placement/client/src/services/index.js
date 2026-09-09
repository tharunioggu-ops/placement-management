import api from './api';

export const authService = {

  register: (data) => api.post('/auth/register', { ...data, role: 'student' }),

  login: (identifier, password) =>
    api.post('/auth/login', { identifier, password }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateProfileImage: (formData) =>
    api.post('/auth/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export const studentService = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  getApplications: () => api.get('/students/applications'),
  getRecommendedJobs: () => api.get('/students/recommended-jobs'),
  uploadResume: (formData) =>
    api.post('/students/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getResume: () => api.get('/students/resume'),
  deleteResume: () => api.delete('/students/resume'),
};

export const jobService = {
  getAllJobs: (filters) => api.get('/jobs', { params: filters }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getRecruiterJobs: () => api.get('/jobs/recruiter/my-jobs'),
};

export const applicationService = {
  createApplication: (data) => api.post('/applications', data),
  getAllApplications: (filters) => api.get('/applications', { params: filters }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  updateApplicationStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  getRecruiterApplications: (companyId) =>
    api.get('/applications/recruiter/applications', { params: { companyId } }),
};

export const companyService = {
  getAllCompanies: (filters) => api.get('/companies', { params: filters }),
  getCompanyById: (id) => api.get(`/companies/${id}`),
  getVacancies: () => api.get('/companies/vacancies'),
  getHiringAnalytics: (params) => api.get('/companies/analytics/hiring', { params }),
  getPublicPlacementAnalytics: (params) => api.get('/companies/analytics/public', { params }),
  getCompanyDetailedAnalytics: (companyName, period = '12-months') => api.get(`/companies/analytics/company/${encodeURIComponent(companyName)}/${period}`),
  compareCompanies: (params) => api.get('/companies/analytics/compare', { params }),
  getCompanyStats: (id) => api.get(`/companies/${id}/stats`),
  createCompany: (data) => api.post('/companies', data),
  updateCompany: (id, data) => api.put(`/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/companies/${id}`),
  getRecruiterCompany: () => api.get('/companies/recruiter/company'),
};

export const announcementService = {
  getAllAnnouncements: () => api.get('/announcements'),
  createAnnouncement: (data) => api.post('/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
};

export const driveService = {
  getAllDrives: (filters) => api.get('/drives', { params: filters }),
  getDriveById: (id) => api.get(`/drives/${id}`),
  createDrive: (data) => api.post('/drives', data),
  updateDrive: (id, data) => api.put(`/drives/${id}`, data),
  deleteDrive: (id) => api.delete(`/drives/${id}`),
};

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllStudents: () => api.get('/admin/students'),
  updateCandidateStatus: (id, placementStatus) => api.put(`/admin/candidates/${id}/status`, { placementStatus }),
  deleteCandidate: (id) => api.delete(`/admin/candidates/${id}`),
  getAllRecruiters: () => api.get('/admin/recruiters'),
  verifyCompany: (id) => api.put(`/admin/companies/${id}/verify`),
  approveJob: (id) => api.put(`/admin/jobs/${id}/approve`),
  rejectJob: (id) => api.put(`/admin/jobs/${id}/reject`),
  getAllApplications: () => api.get('/admin/applications'),
  getPlacementAnalytics: () => api.get('/admin/analytics'),
  getMonthlyReports: (params) => api.get('/admin/reports/monthly', { params }),
  getAllCompaniesAdmin: () => api.get('/admin/companies'),
  updateCompanyAdmin: (id, data) => api.put(`/admin/companies/${id}`, data),
  updateUserAdmin: (id, data) => api.put(`/admin/users/${id}`, data),
  createIncharger: (data) => api.post('/admin/inchargers', data),
  getInchargers: () => api.get('/admin/inchargers'),
  deleteIncharger: (id) => api.delete(`/admin/inchargers/${id}`),
  getPendingStudents: () => api.get('/admin/students/pending'),
  updateStudentVerification: (id, verificationStatus) => api.put(`/admin/students/${id}/verification`, { verificationStatus }),
  getPlacementOperations: () => api.get('/admin/operations'),
};

export const aiService = {
  chat: (message, studentId) => api.post('/ai/chat', { message, studentId }),
  resumeAnalysis: (resumeText, studentId) =>
    api.post('/ai/resume-analysis', { resumeText, studentId }),
  interviewPreparation: (jobTitle, company, skills, studentId) =>
    api.post('/ai/interview-preparation', { jobTitle, company, skills, studentId }),
  jobRecommendation: (studentId) =>
    api.post('/ai/job-recommendation', { studentId }),
};
