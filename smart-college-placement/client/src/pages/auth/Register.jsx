import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService, studentService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  dateOfBirth: '',
  gender: '',
  college: '',
  department: 'CSE',
  course: 'B.Tech',
  year: '',
  semester: '',
  cgpa: '',
  tenthPercentage: '',
  intermediatePercentage: '',
  address: '',
  city: '',
  preferredJobRole: '',
  preferredLocation: '',
  skills: '',
  technicalSkills: '',
  certifications: '',
};

const Register = () => {
  const [formData, setFormData] = useState(initialForm);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addNotification } = useNotification();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      login(response.data.user, response.data.token);

      const profilePayload = {
        name: formData.name,
        phone: formData.phone,
        location: formData.city || formData.address,
        address: formData.address,
        city: formData.city,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        college: formData.college,
        department: formData.department,
        course: formData.course,
        year: formData.year ? Number(formData.year) : undefined,
        semester: formData.semester ? Number(formData.semester) : undefined,
        cgpa: formData.cgpa ? Number(formData.cgpa) : undefined,
        tenthPercentage: formData.tenthPercentage ? Number(formData.tenthPercentage) : undefined,
        intermediatePercentage: formData.intermediatePercentage ? Number(formData.intermediatePercentage) : undefined,
        preferredJobRole: formData.preferredJobRole,
        preferredLocation: formData.preferredLocation,
        skills: formData.skills.split(',').map((item) => item.trim()).filter(Boolean),
        technicalSkills: formData.technicalSkills.split(',').map((item) => item.trim()).filter(Boolean),
        certifications: formData.certifications.split(',').map((item) => item.trim()).filter(Boolean),
      };

      await studentService.updateProfile(profilePayload);

      if (resumeFile) {
        const resumeData = new FormData();
        resumeData.append('resume', resumeFile);
        await studentService.uploadResume(resumeData);
      }

      addNotification('Registration successful', 'success');
      navigate('/student/dashboard');
    } catch (error) {
      addNotification(error.response?.data?.message || error.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-primary to-secondary py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-4xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-wider text-primary text-center mb-2">Create account</p>
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Student Registration</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Create your student profile with academic details and resume</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College / University</label>
              <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="EEE">EEE</option>
                <option value="CIVIL">CIVIL</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree / Course</label>
              <select name="course" value={formData.course} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="B.Tech">B.Tech</option>
                <option value="B.E">B.E</option>
                <option value="B.Sc">B.Sc</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MBA">MBA</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current year</label>
              <select name="year" value={formData.year} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="">Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select name="semester" value={formData.semester} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="">Select</option>
                {[1,2,3,4,5,6,7,8].map((sem) => <option key={sem} value={sem}>{sem}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
              <input type="number" step="0.01" min="0" max="10" name="cgpa" value={formData.cgpa} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">10th Percentage</label>
              <input type="number" step="0.01" min="0" max="100" name="tenthPercentage" value={formData.tenthPercentage} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">12th / Diploma Percentage</label>
              <input type="number" step="0.01" min="0" max="100" name="intermediatePercentage" value={formData.intermediatePercentage} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred job role</label>
              <input type="text" name="preferredJobRole" value={formData.preferredJobRole} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred location</label>
              <input type="text" name="preferredLocation" value={formData.preferredLocation} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="Java, React, SQL" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Technical skills</label>
              <input type="text" name="technicalSkills" value={formData.technicalSkills} onChange={handleChange} placeholder="JavaScript, Node.js, MongoDB" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
              <input type="text" name="certifications" value={formData.certifications} onChange={handleChange} placeholder="AWS, Cisco, Google Cloud" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload resume (PDF, DOC, DOCX)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90">
            {loading ? 'Creating profile...' : 'Create account'}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default Register;
