import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  jobService, 
  studentService, 
  companyService 
} from '../../services';
import { 
  LoadingSpinner, 
  EmptyState, 
  JobHiringAnalytics,
  CompanyAnalytics,
  CompanyComparison,
  ResumeUploadCard,
  CompanyStatsModal,
  JobApplicationModal
} from '../../components';
import { 
  Search, 
  Filter, 
  Building2, 
  Briefcase, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  ExternalLink,
  ChevronRight,
  BarChart2,
  FileCheck
} from 'lucide-react';
import { isEligible, getStatusColor } from '../../utils/helpers';

export const StudentJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    workMode: '',
  });

  const [studentProfile, setStudentProfile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  // Modals state
  const [selectedCompanyIdForModal, setSelectedCompanyIdForModal] = useState(null);
  const [jobToApply, setJobToApply] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [jobsRes, profileRes, compRes, resumeRes, appsRes] = await Promise.all([
        jobService.getAllJobs(filters),
        studentService.getProfile().catch(() => ({ data: { studentProfile: null } })),
        companyService.getVacancies().catch(() => ({ data: { companies: [] } })),
        studentService.getResume().catch(() => ({ data: { resume: null } })),
        studentService.getApplications().catch(() => ({ data: { applications: [] } })),
      ]);

      setJobs(jobsRes.data.jobs || []);
      setStudentProfile(profileRes.data.studentProfile);
      setCompanies(compRes.data.companies || []);

      if (resumeRes.data.hasResume && resumeRes.data.resume) {
        setResumeData(resumeRes.data.resume);
      } else if (profileRes.data.studentProfile?.resume) {
        setResumeData({
          url: profileRes.data.studentProfile.resume,
          originalName: profileRes.data.studentProfile.resumeOriginalName || 'Uploaded_Resume.pdf',
          size: profileRes.data.studentProfile.resumeSize || 0,
        });
      }

      // Track already applied jobs
      if (appsRes.data.applications) {
        const appliedSet = new Set(
          appsRes.data.applications.map((app) => app.jobId?._id || app.jobId)
        );
        setAppliedJobIds(appliedSet);
      }
    } catch (error) {
      console.error('Error fetching job portal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpdated = (newResume) => {
    setResumeData(newResume);
  };

  const handleApplicationSuccess = (jobId) => {
    setAppliedJobIds((prev) => new Set([...prev, jobId]));
  };

  // Filter jobs by search and company
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyId?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany =
      !selectedCompanyFilter ||
      job.companyId?.companyName?.toLowerCase() === selectedCompanyFilter.toLowerCase();

    return matchesSearch && matchesCompany;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50/50 pb-20"
    >
      {/* Top Banner / Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={13} className="text-amber-400" />
                <span>Smart Campus Placement Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                Opportunities &amp; Enterprise Vacancies
              </h1>
              <p className="text-sm sm:text-base text-indigo-200 mt-2 max-w-2xl">
                Explore verified vacancies from leading companies, analyze hiring trends, manage your verified resume, and apply with confidence.
              </p>
            </div>

            {/* Quick Status Pill Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-6 shrink-0">
              <div>
                <p className="text-xs text-indigo-200 uppercase font-bold">Total Vacancies</p>
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {companies.reduce((acc, c) => acc + (c.totalVacancies || 0), 0)}+
                </p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-xs text-indigo-200 uppercase font-bold">Your Applications</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {appliedJobIds.size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 -mt-6">
        {/* 1. Global Candidate Resume Status Card */}
        <div className="mb-8">
          <ResumeUploadCard
            currentResume={resumeData}
            onResumeUpdated={handleResumeUpdated}
            requiredWarning={!resumeData?.url}
          />
        </div>

        {/* 2. Company Vacancy Information Cards (TCS, Google, Infosys, Microsoft, etc.) */}
        <div className="mb-12">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Partner Enterprise Vacancies</h2>
              <p className="text-xs text-gray-500">Live dynamic vacancy counts retrieved directly from company drives.</p>
            </div>
            <span className="text-xs font-semibold text-primary">Click any company to inspect hiring statistics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {companies.map((comp) => (
              <motion.div
                key={comp._id}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => setSelectedCompanyIdForModal(comp._id)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 p-2 flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
                      {comp.logo ? (
                        <img src={comp.logo} alt={comp.companyName} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Building2 size={24} className="text-primary" />
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-primary border border-indigo-100 group-hover:bg-primary group-hover:text-white transition-colors">
                      {comp.totalVacancies} Vacancies
                    </span>
                  </div>

                  <h3 className="font-black text-gray-900 text-lg group-hover:text-primary transition-colors">
                    {comp.companyName}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{comp.industry || 'IT & Software'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>{comp.hiringCount}+ Recruited</span>
                  <span className="inline-flex items-center text-primary font-bold gap-1 group-hover:translate-x-0.5 transition-transform">
                    Details <ChevronRight size={14} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. Interactive Selected Company Analytics & Comparison */}
        <CompanyAnalytics />
        <CompanyComparison />

        {/* 4. Job Listings with Filters and Apply Flow */}
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Campus Positions</h2>
              <p className="text-xs text-gray-500">Filter and apply to positions matching your qualifications.</p>
            </div>

            {/* Quick Company Chip Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedCompanyFilter('')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  !selectedCompanyFilter
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                All Roles ({jobs.length})
              </button>
              {companies.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedCompanyFilter(c.companyName)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedCompanyFilter.toLowerCase() === c.companyName.toLowerCase()
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {c.companyName} ({c.totalVacancies})
                </button>
              ))}
            </div>
          </div>

          {/* Search & Location / Type Filter Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search job title, skills, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={filters.jobType}
                onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Job Types</option>
                <option value="Full Time">Full Time</option>
                <option value="Internship">Internship</option>
                <option value="Part Time">Part Time</option>
              </select>

              <select
                value={filters.workMode}
                onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Work Modes</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          {/* Job Cards Grid */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
              <EmptyState message="No matching job opportunities found. Try adjusting your search filters." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => {
                const isAlreadyApplied = appliedJobIds.has(job._id);
                const eligible = studentProfile ? isEligible(studentProfile, job) : true;

                return (
                  <motion.div
                    key={job._id}
                    whileHover={{ y: -6 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all flex flex-col justify-between text-left"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-50 text-primary border border-indigo-100">
                          {job.vacancies || 1} Vacancies
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          {job.workMode || 'Hybrid'}
                        </span>
                      </div>

                      {/* Title & Company */}
                      <h3 className="text-xl font-bold text-gray-900 leading-snug mb-1">
                        {job.title}
                      </h3>
                      <button
                        onClick={() => job.companyId?._id && setSelectedCompanyIdForModal(job.companyId._id)}
                        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 mb-4"
                      >
                        <Building2 size={14} /> {job.companyId?.companyName || 'Corporate Partner'}
                      </button>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50/80 p-3 rounded-2xl mb-4">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase">Location</span>
                          <span className="font-semibold text-gray-800">{job.location || 'Pan India'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase">Package</span>
                          <span className="font-bold text-emerald-700">{job.salary || 'Competitive'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase">Min CGPA</span>
                          <span className="font-semibold text-gray-800">{job.minimumCGPA || 'None'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase">Role Type</span>
                          <span className="font-semibold text-gray-800">{job.jobType || 'Full Time'}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {job.requiredSkills.slice(0, 3).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-gray-400">
                              +{job.requiredSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      {/* Venue & Location Snippet */}
                      {(job.interviewVenue || job.companyId?.interviewVenue) && (
                        <div className="text-[11px] text-gray-500 mb-3 flex items-center gap-1.5 bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                          <MapPin size={12} className="text-primary shrink-0" />
                          <span className="truncate">
                            <strong>Venue:</strong> {job.interviewVenue || job.companyId?.interviewVenue}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer & Actions */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        {studentProfile && (
                          eligible ? (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              ✓ Eligible
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              CGPA Low
                            </span>
                          )
                        )}
                        {job.applicationDeadline && (
                          <span className="text-[11px] text-gray-400 font-medium">
                            Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => job.companyId?._id && setSelectedCompanyIdForModal(job.companyId._id)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-primary bg-indigo-50 hover:bg-indigo-100 transition-all flex items-center gap-1.5 border border-indigo-100"
                        >
                          <Building2 size={13} /> View Company Details
                        </button>

                        {isAlreadyApplied ? (
                          <button
                            disabled
                            className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-100 flex items-center gap-1.5 cursor-default"
                          >
                            <CheckCircle2 size={15} /> Applied
                          </button>
                        ) : (
                          <button
                            onClick={() => setJobToApply(job)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all flex items-center gap-1.5"
                          >
                            Apply Now <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Company Statistics Modal */}
      {selectedCompanyIdForModal && (
        <CompanyStatsModal
          companyId={selectedCompanyIdForModal}
          onClose={() => setSelectedCompanyIdForModal(null)}
          onSelectJobToApply={(role) => {
            const foundJob = jobs.find((j) => j._id === role._id);
            if (foundJob) {
              setJobToApply(foundJob);
            }
          }}
        />
      )}

      {/* Job Application Modal with Attached Resume Validation */}
      {jobToApply && (
        <JobApplicationModal
          job={jobToApply}
          currentResume={resumeData}
          onResumeUpdated={handleResumeUpdated}
          onClose={() => setJobToApply(null)}
          onApplicationSuccess={handleApplicationSuccess}
        />
      )}
    </motion.div>
  );
};

export default StudentJobs;
