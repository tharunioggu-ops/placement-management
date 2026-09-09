import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit3,
  Save,
  X,
  GraduationCap,
  PlusCircle,
  Trash2,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Eye,
  RefreshCw,
  Award,
  Sparkles,
  Calendar,
  Building,
} from 'lucide-react';
import { authService, studentService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotification();
  const toast = {
    success: (msg) => addNotification(msg, 'success'),
    error: (msg) => addNotification(msg, 'error'),
    loading: (msg) => addNotification(msg, 'info'),
  };
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Personal Information
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    bio: '',
  });

  // Education Records list
  const [educationList, setEducationList] = useState([]);
  const [showAddEducationModal, setShowAddEducationModal] = useState(false);
  const [editingEducationIndex, setEditingEducationIndex] = useState(null);
  const [educationForm, setEducationForm] = useState({
    qualification: 'Bachelor of Technology (B.Tech)',
    institutionName: '',
    passingYear: '2026',
    percentageOrCgpa: '',
    hasBacklogs: 'No',
    backlogsCount: 0,
  });

  // Resume State
  const [resumeData, setResumeData] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setFetching(true);
      const res = await studentService.getProfile();
      const profile = res.data.studentProfile;

      if (profile) {
        setFormData({
          name: profile.userId?.name || user?.name || '',
          email: profile.userId?.email || user?.email || '',
          phone: profile.userId?.phone || profile.phone || user?.phone || '',
          location: profile.userId?.location || profile.city || profile.address || user?.location || '',
          bio: profile.userId?.bio || user?.bio || '',
        });

        setEducationList(Array.isArray(profile.education) ? profile.education : []);

        if (profile.resume) {
          setResumeData({
            url: profile.resume,
            originalName: profile.resumeOriginalName || 'Uploaded_Resume.pdf',
            size: profile.resumeSize || 0,
            updatedAt: profile.resumeUpdatedAt || profile.updatedAt,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch student profile:', err);
      // Fall back to user context
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          location: user.location || '',
          bio: user.bio || '',
        });
      }
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Education Modal Handlers
  const openAddEducationModal = () => {
    setEditingEducationIndex(null);
    setEducationForm({
      qualification: 'Bachelor of Technology (B.Tech)',
      institutionName: '',
      passingYear: new Date().getFullYear().toString(),
      percentageOrCgpa: '',
      hasBacklogs: 'No',
      backlogsCount: 0,
    });
    setShowAddEducationModal(true);
  };

  const openEditEducationModal = (index) => {
    setEditingEducationIndex(index);
    setEducationForm({ ...educationList[index] });
    setShowAddEducationModal(true);
  };

  const handleSaveEducation = (e) => {
    e.preventDefault();
    if (!educationForm.qualification.trim() || !educationForm.institutionName.trim() || !educationForm.percentageOrCgpa.trim()) {
      toast.error('Please fill in all required education fields.');
      return;
    }

    const updatedItem = {
      ...educationForm,
      backlogsCount: educationForm.hasBacklogs === 'Yes' ? Math.max(1, Number(educationForm.backlogsCount) || 1) : 0,
    };

    if (editingEducationIndex !== null) {
      const updated = [...educationList];
      updated[editingEducationIndex] = updatedItem;
      setEducationList(updated);
      toast.success('Education record updated!');
    } else {
      setEducationList([...educationList, updatedItem]);
      toast.success('New education record added!');
    }

    setShowAddEducationModal(false);
  };

  const handleDeleteEducation = (index) => {
    if (window.confirm('Are you sure you want to remove this education record?')) {
      const updated = educationList.filter((_, idx) => idx !== index);
      setEducationList(updated);
      toast.success('Education record removed.');
    }
  };

  // Profile Save
  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // Compute total backlogs across all education records
      const totalBacklogs = educationList.reduce((acc, curr) => {
        if (curr.hasBacklogs === 'Yes') {
          return acc + (Number(curr.backlogsCount) || 1);
        }
        return acc;
      }, 0);

      const payload = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        address: formData.location,
        city: formData.location,
        education: educationList,
        backlogs: totalBacklogs,
      };

      const res = await studentService.updateProfile(payload);
      if (res.data.success) {
        if (res.data.user) {
          updateUser(res.data.user);
        } else {
          updateUser({
            name: formData.name,
            phone: formData.phone,
            location: formData.location,
            bio: formData.bio,
          });
        }
        setIsEditing(false);
        toast.success('Profile and education details updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Avatar Image Upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('profileImage', file);

    try {
      toast.loading('Uploading avatar...', { id: 'img-upload' });
      const res = await authService.updateProfileImage(data);
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile picture updated!', { id: 'img-upload' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload picture.', { id: 'img-upload' });
    }
  };

  // Resume Upload Handlers
  const handleResumeSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Only .PDF, .DOC, and .DOCX files are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Resume size exceeds 10MB limit.');
      return;
    }

    try {
      setResumeUploading(true);
      toast.loading('Uploading resume...', { id: 'resume-upload' });
      const data = new FormData();
      data.append('resume', file);

      const res = await studentService.uploadResume(data);
      if (res.data.success) {
        setResumeData(res.data.resume);
        toast.success('Resume uploaded and verified successfully!', { id: 'resume-upload' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume.', { id: 'resume-upload' });
    } finally {
      setResumeUploading(false);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  const handleRemoveResume = async () => {
    if (!window.confirm('Are you sure you want to remove your resume?')) return;
    try {
      setResumeUploading(true);
      await studentService.deleteResume();
      setResumeData(null);
      toast.success('Resume removed successfully.');
    } catch (err) {
      toast.error('Failed to remove resume.');
    } finally {
      setResumeUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getResumeUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    return `http://localhost:5000${url}`;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const avatarUrl = user?.profileImage ? `http://localhost:5000${user.profileImage}` : null;
  const hasBacklogsOverall = educationList.some((e) => e.hasBacklogs === 'Yes' || e.hasBacklogs === true);
  const totalBacklogsCount = educationList.reduce((acc, curr) => acc + (curr.hasBacklogs === 'Yes' ? (Number(curr.backlogsCount) || 1) : 0), 0);

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-sm font-semibold text-gray-500">Loading student profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Main Profile Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Header Cover Banner */}
          <div className="h-40 sm:h-48 bg-gradient-to-r from-slate-900 via-indigo-950 to-primary relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-300" />
                Verified Student Profile
              </span>
            </div>
          </div>

          {/* Profile Header Block */}
          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-6">
              {/* Profile Avatar with Camera Overlay */}
              <div className="flex items-end gap-5">
                <div className="relative group">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white p-1.5 shadow-xl">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-primary text-3xl sm:text-4xl font-black overflow-hidden relative shadow-inner">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(formData.name || user?.name)
                      )}
                      {/* Hover Overlay */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                      >
                        <Camera size={24} />
                        <span className="text-[10px] font-bold mt-1">Change</span>
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                  />
                </div>

                {/* Name & Headline */}
                <div className="mb-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {formData.name || user?.name || 'Student Candidate'}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                    <span>{formData.email || user?.email}</span>
                    <span>•</span>
                    <span className="capitalize font-semibold text-primary">{user?.role || 'Student'}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Edit Profile Toggle / Save Changes */}
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1.5"
                    >
                      <X size={16} /> Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition flex items-center gap-1.5 disabled:opacity-70"
                    >
                      <Save size={16} />
                      {loading ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition flex items-center gap-2 hover:scale-[1.02]"
                  >
                    <Edit3 size={16} /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Quick Summary Pill Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Status</span>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  ● Active Placement
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Backlogs</span>
                <span
                  className={`text-sm font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                    hasBacklogsOverall
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {hasBacklogsOverall ? `${totalBacklogsCount} Backlog(s)` : 'No Backlogs ✓'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Education</span>
                <span className="text-sm font-bold text-gray-800 inline-block mt-0.5">
                  {educationList.length} Qualifications
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Resume</span>
                <span
                  className={`text-sm font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                    resumeData?.url
                      ? 'bg-indigo-50 text-primary'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {resumeData?.url ? 'Verified Attached' : 'Not Uploaded'}
                </span>
              </div>
            </div>

            {/* SECTION 1: Personal Details Form */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center font-bold">
                    <UserIcon size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                </div>
                {isEditing && (
                  <span className="text-xs font-semibold text-primary">Editing Personal Details</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100">
                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 border border-gray-100">
                      <UserIcon size={16} className="text-primary" />
                      <span>{formData.name || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* 2. Email Address (Non-editable) */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-xs text-gray-400 font-normal">(Verified account email)</span>
                  </label>
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-100/80 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 cursor-not-allowed">
                    <Mail size={16} className="text-gray-400" />
                    <span>{formData.email}</span>
                  </div>
                </div>

                {/* 3. Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 border border-gray-100">
                      <Phone size={16} className="text-primary" />
                      <span>{formData.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* 4. Location */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Current Location / City <span className="text-rose-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Bangalore, Karnataka"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 border border-gray-100">
                      <MapPin size={16} className="text-primary" />
                      <span>{formData.location || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* 5. Professional Bio */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Professional Bio / Career Objective
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Brief overview of your academic focus, technical interests, and career ambitions..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed border border-gray-100">
                      {formData.bio || <span className="text-gray-400 italic">No professional bio added yet.</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Education Details (Multiple records with + Add Education) */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Education Details</h2>
                    <p className="text-xs text-gray-500">10th, Intermediate/Diploma, Degree, or other qualifications</p>
                  </div>
                </div>

                <button
                  onClick={openAddEducationModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle size={15} /> + Add Education
                </button>
              </div>

              {educationList.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <GraduationCap size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-bold text-gray-700">No education records added yet</p>
                  <p className="text-xs text-gray-500 mt-1">Click "+ Add Education" to add your 10th, 12th, or Degree marks.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {educationList.map((edu, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -2 }}
                      className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all text-left"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {edu.qualification}
                          </span>
                          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                            <Calendar size={13} /> {edu.passingYear}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                          <Building size={15} className="text-gray-400 shrink-0" />
                          <span className="truncate">{edu.institutionName}</span>
                        </h3>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 bg-gray-50 rounded-xl">
                            <span className="text-gray-400 block text-[10px] uppercase font-bold">Marks / CGPA</span>
                            <span className="text-sm font-black text-emerald-700">{edu.percentageOrCgpa}</span>
                          </div>
                          <div className="p-2.5 bg-gray-50 rounded-xl">
                            <span className="text-gray-400 block text-[10px] uppercase font-bold">Backlogs Status</span>
                            <span
                              className={`text-xs font-bold ${
                                edu.hasBacklogs === 'Yes' ? 'text-amber-700 font-extrabold' : 'text-emerald-700'
                              }`}
                            >
                              {edu.hasBacklogs === 'Yes' ? `Yes (${edu.backlogsCount} backlog)` : 'No Backlogs'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons on card */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditEducationModal(idx)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-primary hover:bg-gray-100 transition flex items-center gap-1"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEducation(idx)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center gap-1"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 3: Resume Upload Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Resume & Documentation</h2>
                  <p className="text-xs text-gray-500">Your verified campus placement resume submitted to employers</p>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <input
                  type="file"
                  ref={resumeInputRef}
                  onChange={handleResumeSelect}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />

                {resumeData?.url ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shrink-0">
                        <FileText size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                            {resumeData.originalName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatFileSize(resumeData.size)} • Uploaded{' '}
                          {resumeData.updatedAt
                            ? new Date(resumeData.updatedAt).toLocaleDateString()
                            : 'Recently'}
                        </p>
                      </div>
                    </div>

                    {/* View, Replace, Remove buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={getResumeUrl(resumeData.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-primary bg-white border border-indigo-200 hover:bg-indigo-50 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Eye size={14} /> View Resume
                      </a>
                      <button
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={resumeUploading}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <RefreshCw size={14} className={resumeUploading ? 'animate-spin' : ''} /> Replace
                      </button>
                      <button
                        onClick={handleRemoveResume}
                        disabled={resumeUploading}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => resumeInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-primary rounded-2xl p-8 text-center cursor-pointer hover:bg-indigo-50/20 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                      <UploadCloud size={28} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                      {resumeUploading ? 'Uploading Resume...' : 'Upload your Resume from device'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports PDF, DOC, or DOCX documents up to 10MB
                    </p>
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary shadow-sm hover:bg-primary/90 transition"
                    >
                      Select File
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Persistent Bottom Save Bar if in Editing Mode */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
                <p className="text-xs text-gray-500">Make sure to save your changes before leaving this page.</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition flex items-center gap-2 disabled:opacity-70"
                  >
                    <Save size={16} /> {loading ? 'Saving Profile...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add / Edit Education Modal */}
      <AnimatePresence>
        {showAddEducationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 max-w-lg w-full relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {editingEducationIndex !== null ? 'Edit Education Record' : 'Add Education Record'}
                    </h3>
                    <p className="text-xs text-gray-500">Provide verified academic marks and institution</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddEducationModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEducation} className="space-y-4">
                {/* Qualification */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Qualification / Degree <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={educationForm.qualification}
                    onChange={(e) => setEducationForm({ ...educationForm, qualification: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white"
                  >
                    <option value="Bachelor of Technology (B.Tech)">Bachelor of Technology (B.Tech)</option>
                    <option value="Bachelor of Engineering (B.E)">Bachelor of Engineering (B.E)</option>
                    <option value="Intermediate / 12th Standard">Intermediate / 12th Standard</option>
                    <option value="Secondary School (10th)">Secondary School (10th)</option>
                    <option value="Diploma in Engineering">Diploma in Engineering</option>
                    <option value="Master of Technology (M.Tech)">Master of Technology (M.Tech)</option>
                    <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                    <option value="Bachelor of Science (B.Sc / BCA)">Bachelor of Science (B.Sc / BCA)</option>
                  </select>
                </div>

                {/* Institution Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Institution / College / School Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={educationForm.institutionName}
                    onChange={(e) => setEducationForm({ ...educationForm, institutionName: e.target.value })}
                    placeholder="e.g. Smart Institute of Technology"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>

                {/* Marks / Percentage / CGPA & Passing Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Marks / CGPA / % <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={educationForm.percentageOrCgpa}
                      onChange={(e) => setEducationForm({ ...educationForm, percentageOrCgpa: e.target.value })}
                      placeholder="e.g. 8.8 CGPA or 92%"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Passing Year <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="2000"
                      max="2030"
                      value={educationForm.passingYear}
                      onChange={(e) => setEducationForm({ ...educationForm, passingYear: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Backlogs: Yes / No Radio Buttons */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Active / Standing Backlogs in this Qualification?
                  </label>
                  <div className="flex items-center gap-4">
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-xs transition ${
                        educationForm.hasBacklogs === 'No'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hasBacklogs"
                        value="No"
                        checked={educationForm.hasBacklogs === 'No'}
                        onChange={() => setEducationForm({ ...educationForm, hasBacklogs: 'No', backlogsCount: 0 })}
                        className="hidden"
                      />
                      <CheckCircle2 size={16} /> No Backlogs
                    </label>

                    <label
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-xs transition ${
                        educationForm.hasBacklogs === 'Yes'
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hasBacklogs"
                        value="Yes"
                        checked={educationForm.hasBacklogs === 'Yes'}
                        onChange={() => setEducationForm({ ...educationForm, hasBacklogs: 'Yes', backlogsCount: 1 })}
                        className="hidden"
                      />
                      <AlertTriangle size={16} /> Yes (Has Backlogs)
                    </label>
                  </div>

                  {educationForm.hasBacklogs === 'Yes' && (
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Number of Active Backlogs
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={educationForm.backlogsCount}
                        onChange={(e) =>
                          setEducationForm({ ...educationForm, backlogsCount: Math.max(1, parseInt(e.target.value) || 1) })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-amber-300 text-sm font-bold text-amber-900 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddEducationModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
                  >
                    {editingEducationIndex !== null ? 'Update Record' : 'Save Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProfile;
