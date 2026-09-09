import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService, companyService, jobService } from '../../services';
import { Card, LoadingSpinner } from '../../components';
import { BarChart3, Users, Building2, Briefcase } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [inchargers, setInchargers] = useState([]);
  const [deleteInchargerTarget, setDeleteInchargerTarget] = useState(null);
  const [deletingIncharger, setDeletingIncharger] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [companySearch, setCompanySearch] = useState('');
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [companiesError, setCompaniesError] = useState('');
  const [companyForm, setCompanyForm] = useState({ companyName: '', logo: '', description: '', website: '', registrationLink: '', industry: '', location: '', city: '', state: '', country: 'India', fullAddress: '', officeAddress: '', interviewVenue: '', email: '', phone: '', companySize: 'Enterprise', totalVacancies: 0, jobLocations: '', workModes: 'On-site, Hybrid, Remote' });
  const [inchargerForm, setInchargerForm] = useState({ name: '', username: '', email: '', password: '' });
  const [opportunityForm, setOpportunityForm] = useState({
    companyId: '', title: '', description: '', location: '', jobType: 'Full Time',
    workMode: 'Hybrid', salary: '', vacancies: 1, minimumCGPA: '', maximumBacklogs: 0,
    requiredSkills: '', eligibleDepartments: '', applicationDeadline: '',
  });
  const [actionMessage, setActionMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await adminService.getDashboardStats();
      const [analyticsRes, pendingRes, inchargerRes, companiesRes, opportunitiesRes] = await Promise.all([
        adminService.getPlacementAnalytics(),
        adminService.getPendingStudents(),
        adminService.getInchargers(),
        companyService.getAllCompanies(),
        jobService.getRecruiterJobs().catch(() => ({ data: { jobs: [] } })),
      ]);
      setStats(statsRes.data.stats);
      setAnalytics(analyticsRes.data.analytics);
      setPendingStudents(pendingRes.data.students || []);
      setInchargers(inchargerRes.data.inchargers || []);
      const loadedCompanies = companiesRes.data.companies || [];
      setCompanies(Array.from(new Map(loadedCompanies.filter((company) => company?._id && company.companyName).map((company) => [company._id, company])).values()).sort((first, second) => first.companyName.localeCompare(second.companyName)));
      setCompaniesError('');
      setOpportunities(opportunitiesRes.data.jobs || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.config?.url?.includes('/companies')) {
        setCompaniesError(error.response?.data?.message || 'Unable to load companies.');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshCompanies = async () => {
    try {
      const response = await companyService.getAllCompanies();
      const loadedCompanies = response.data.companies || [];
      setCompanies(Array.from(new Map(loadedCompanies.filter((company) => company?._id && company.companyName).map((company) => [company._id, company])).values()).sort((first, second) => first.companyName.localeCompare(second.companyName)));
      setCompaniesError('');
      setActionMessage(`${loadedCompanies.length} companies available for placement opportunities.`);
    } catch (error) {
      setCompaniesError(error.response?.data?.message || 'Unable to load companies.');
    }
  };

  const createOpportunity = async (event) => {
    event.preventDefault();
    if (!opportunityForm.companyId) {
      setActionMessage('Select a company before publishing the opportunity.');
      return;
    }
    try {
      const response = await jobService.createJob({
        ...opportunityForm,
        vacancies: Number(opportunityForm.vacancies),
        minimumCGPA: opportunityForm.minimumCGPA ? Number(opportunityForm.minimumCGPA) : 0,
        maximumBacklogs: Number(opportunityForm.maximumBacklogs),
        requiredSkills: opportunityForm.requiredSkills.split(',').map((item) => item.trim()).filter(Boolean),
        eligibleDepartments: opportunityForm.eligibleDepartments.split(',').map((item) => item.trim()).filter(Boolean),
      });
      setOpportunities((current) => [response.data.job, ...current]);
      setOpportunityForm({ companyId: '', title: '', description: '', location: '', jobType: 'Full Time', workMode: 'Hybrid', salary: '', vacancies: 1, minimumCGPA: '', maximumBacklogs: 0, requiredSkills: '', eligibleDepartments: '', applicationDeadline: '' });
      setActionMessage('Placement opportunity published. Students can now view and apply.');
    } catch (error) {
      setActionMessage(error.response?.data?.message || 'Unable to publish placement opportunity.');
    }
  };

  const createCompany = async (event) => {
    event.preventDefault();
    try {
      const response = await companyService.createCompany({
        ...companyForm,
        totalVacancies: Number(companyForm.totalVacancies) || 0,
        jobLocations: companyForm.jobLocations.split(',').map((item) => item.trim()).filter(Boolean),
        workModes: companyForm.workModes.split(',').map((item) => item.trim()).filter(Boolean),
      });
      setCompanies((current) => [...current, response.data.company]);
      setOpportunityForm((current) => ({ ...current, companyId: response.data.company._id }));
      setCompanyForm({ companyName: '', logo: '', description: '', website: '', registrationLink: '', industry: '', location: '', city: '', state: '', country: 'India', fullAddress: '', officeAddress: '', interviewVenue: '', email: '', phone: '', companySize: 'Enterprise', totalVacancies: 0, jobLocations: '', workModes: 'On-site, Hybrid, Remote' });
      setActionMessage('Company added. You can now publish its placement opportunity.');
    } catch (error) {
      setActionMessage(error.response?.data?.message || 'Unable to add company.');
    }
  };

  const updateVerification = async (id, verificationStatus) => {
    try {
      await adminService.updateStudentVerification(id, verificationStatus);
      setPendingStudents((current) => current.filter((student) => student.userId?._id !== id));
      setActionMessage(`Student ${verificationStatus}.`);
    } catch (error) {
      setActionMessage(error.response?.data?.message || 'Unable to update student verification.');
    }
  };

  const createIncharger = async (event) => {
    event.preventDefault();
    try {
      const response = await adminService.createIncharger(inchargerForm);
      setInchargers((current) => [...current, response.data.incharger]);
      setInchargerForm({ name: '', username: '', email: '', password: '' });
      setActionMessage('Placement incharge created.');
    } catch (error) {
      setActionMessage(error.response?.data?.message || 'Unable to create placement incharge.');
    }
  };

  const deleteIncharger = async () => {
    if (!deleteInchargerTarget?._id) return;
    setDeletingIncharger(true);
    try {
      await adminService.deleteIncharger(deleteInchargerTarget._id);
      setInchargers((current) => current.filter((incharger) => incharger._id !== deleteInchargerTarget._id));
      setActionMessage('Placement incharge deleted successfully.');
      setDeleteInchargerTarget(null);
    } catch (error) {
      setActionMessage(error.response?.data?.message || 'Unable to delete placement incharge.');
    } finally {
      setDeletingIncharger(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents, icon: Users, color: 'text-blue-600' },
    { label: 'Total Inchargers', value: stats?.totalInchargers, icon: Building2, color: 'text-purple-600' },
    { label: 'Total Companies', value: stats?.totalCompanies, icon: Building2, color: 'text-indigo-600' },
    { label: 'Total Jobs', value: stats?.totalJobs, icon: Briefcase, color: 'text-green-600' },
    { label: 'Total Applications', value: stats?.totalApplications, icon: BarChart3, color: 'text-orange-600' },
    { label: 'Placed Students', value: stats?.placedStudents, icon: Users, color: 'text-green-600' },
  ];
  const filteredCompanies = companies.filter((company) => `${company.companyName} ${company.industry || ''} ${company.location || ''}`.toLowerCase().includes(companySearch.toLowerCase()));
  const selectedCompany = companies.find((company) => company._id === opportunityForm.companyId);
  const selectCompany = (companyId) => {
    setOpportunityForm((current) => ({ ...current, companyId }));
    setCompanyMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold mb-2 text-gray-800">Training &amp; Placement Officer</h1>
      <p className="text-gray-600 mb-8">Manage placement inchargers, approve students, and oversee campus hiring operations.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div key={idx} whileHover={{ scale: 1.05 }}>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                  </div>
                  <Icon className={`${card.color} w-12 h-12`} />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Placement Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Placed Students</span>
              <span className="font-bold text-green-600">{analytics?.placedStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Not Placed</span>
              <span className="font-bold text-red-600">{analytics?.notPlacedStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Not Eligible</span>
              <span className="font-bold text-yellow-600">{analytics?.notEligibleStudents}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/tpo/candidates" className="block p-3 bg-primary/10 text-primary rounded hover:bg-primary/20">
              Manage Students
            </a>
            <a href="/tpo/candidates" className="block p-3 bg-secondary/10 text-secondary rounded hover:bg-secondary/20">
              Manage Student Verification
            </a>
            <a href="/tpo/reports" className="block p-3 bg-accent/10 text-accent rounded hover:bg-accent/20">
              Placement Reports
            </a>
            <a href="/tpo/dashboard" className="block p-3 bg-green-500/10 text-green-600 rounded hover:bg-green-500/20">
              Dashboard Overview
            </a>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-2xl font-bold">Publish Placement Opportunity</h2><p className="text-sm text-gray-500">Published opportunities appear in the student Jobs portal immediately.</p></div>
          <span className="text-sm font-semibold text-emerald-600">{opportunities.length} opportunities</span>
        </div>
        {companies.length === 0 ? <div className="rounded-lg bg-amber-50 p-4"><p className="mb-3 text-sm text-amber-800">{companiesError || 'Add a company before publishing an opportunity.'}</p><div className="mb-4 flex gap-2"><button type="button" onClick={refreshCompanies} className="rounded-lg border border-amber-300 px-3 py-2 text-sm font-bold text-amber-800">Refresh company list</button></div><form onSubmit={createCompany} className="grid grid-cols-1 gap-3 md:grid-cols-3"><input required placeholder="Company name" value={companyForm.companyName} onChange={(event) => setCompanyForm({ ...companyForm, companyName: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input required placeholder="Industry" value={companyForm.industry} onChange={(event) => setCompanyForm({ ...companyForm, industry: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input required placeholder="Location" value={companyForm.location} onChange={(event) => setCompanyForm({ ...companyForm, location: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input placeholder="Logo / company image URL" value={companyForm.logo} onChange={(event) => setCompanyForm({ ...companyForm, logo: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input placeholder="Official website URL" value={companyForm.website} onChange={(event) => setCompanyForm({ ...companyForm, website: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input placeholder="Student registration form URL" value={companyForm.registrationLink} onChange={(event) => setCompanyForm({ ...companyForm, registrationLink: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input placeholder="Contact email" type="email" value={companyForm.email} onChange={(event) => setCompanyForm({ ...companyForm, email: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input placeholder="Contact phone" value={companyForm.phone} onChange={(event) => setCompanyForm({ ...companyForm, phone: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><select value={companyForm.companySize} onChange={(event) => setCompanyForm({ ...companyForm, companySize: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm"><option>Startup</option><option>Small</option><option>Medium</option><option>Large</option><option>Enterprise</option></select><input placeholder="City" value={companyForm.city} onChange={(event) => setCompanyForm({ ...companyForm, city: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input placeholder="State" value={companyForm.state} onChange={(event) => setCompanyForm({ ...companyForm, state: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input placeholder="Country" value={companyForm.country} onChange={(event) => setCompanyForm({ ...companyForm, country: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input placeholder="Full address" value={companyForm.fullAddress} onChange={(event) => setCompanyForm({ ...companyForm, fullAddress: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm md:col-span-2" /><input placeholder="Office address" value={companyForm.officeAddress} onChange={(event) => setCompanyForm({ ...companyForm, officeAddress: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input placeholder="Interview venue" value={companyForm.interviewVenue} onChange={(event) => setCompanyForm({ ...companyForm, interviewVenue: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input placeholder="Job locations, comma separated" value={companyForm.jobLocations} onChange={(event) => setCompanyForm({ ...companyForm, jobLocations: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input placeholder="Work modes, comma separated" value={companyForm.workModes} onChange={(event) => setCompanyForm({ ...companyForm, workModes: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><input type="number" min="0" placeholder="Total vacancies" value={companyForm.totalVacancies} onChange={(event) => setCompanyForm({ ...companyForm, totalVacancies: event.target.value })} className="rounded-lg border border-amber-200 px-3 py-2 text-sm" /><textarea placeholder="Company description" value={companyForm.description} onChange={(event) => setCompanyForm({ ...companyForm, description: event.target.value })} className="min-h-20 rounded-lg border border-amber-200 px-3 py-2 text-sm md:col-span-2" /><button type="submit" className="rounded-lg bg-primary px-4 py-2 font-bold text-white">Add company profile</button></form></div> : <form onSubmit={createOpportunity} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2"><div className="mb-2 flex items-center gap-2"><input value={companySearch} onChange={(event) => setCompanySearch(event.target.value)} placeholder="Search registered companies by name, industry, or location" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /><button type="button" onClick={refreshCompanies} title="Refresh all companies" className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600">Refresh</button></div><div className="relative"><button type="button" onClick={() => setCompanyMenuOpen((current) => !current)} className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm font-semibold text-gray-800 shadow-sm"><span>{selectedCompany ? selectedCompany.companyName : `All Companies (${companies.length})`}</span><span className="text-gray-400">{companyMenuOpen ? '▲' : '▼'}</span></button>{companyMenuOpen && <div className="absolute left-0 right-0 z-20 mt-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-xl"><button type="button" onClick={() => selectCompany('')} className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-gray-600 hover:bg-gray-50">All Companies ({companies.length})</button>{filteredCompanies.length === 0 ? <p className="px-3 py-4 text-sm text-gray-500">No registered companies match your search.</p> : filteredCompanies.map((company) => <button type="button" key={company._id} onClick={() => selectCompany(company._id)} className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-indigo-50 ${opportunityForm.companyId === company._id ? 'bg-indigo-50 font-bold text-primary' : 'text-gray-700'}`}>{company.companyName}<span className="ml-2 text-xs text-gray-400">{company.industry || 'Industry not provided'}{company.location ? ` · ${company.location}` : ''}</span></button>)}</div>}</div>{selectedCompany && <div className="mt-2 flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-gray-700"><div className="flex items-center gap-3">{selectedCompany.logo && <img src={selectedCompany.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />}<div><p className="font-bold text-gray-900">{selectedCompany.companyName}</p><p>{selectedCompany.location || selectedCompany.fullAddress || 'Location not provided'} · {selectedCompany.industry || 'Industry not provided'}</p></div></div><button type="button" onClick={() => selectCompany('')} className="rounded-md border border-indigo-200 bg-white px-2 py-1 font-bold text-primary">Clear Selection</button></div>}</div>
          <input required placeholder="Opportunity title" value={opportunityForm.title} onChange={(event) => setOpportunityForm({ ...opportunityForm, title: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <input required placeholder="Location" value={opportunityForm.location} onChange={(event) => setOpportunityForm({ ...opportunityForm, location: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <input placeholder="Salary / package" value={opportunityForm.salary} onChange={(event) => setOpportunityForm({ ...opportunityForm, salary: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <select value={opportunityForm.jobType} onChange={(event) => setOpportunityForm({ ...opportunityForm, jobType: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm"><option>Full Time</option><option>Internship</option><option>Part Time</option></select>
          <select value={opportunityForm.workMode} onChange={(event) => setOpportunityForm({ ...opportunityForm, workMode: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm"><option>On-site</option><option>Remote</option><option>Hybrid</option></select>
          <input type="number" min="1" placeholder="Vacancies" value={opportunityForm.vacancies} onChange={(event) => setOpportunityForm({ ...opportunityForm, vacancies: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <input type="date" required value={opportunityForm.applicationDeadline} onChange={(event) => setOpportunityForm({ ...opportunityForm, applicationDeadline: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <input type="number" min="0" max="10" step="0.01" placeholder="Minimum CGPA" value={opportunityForm.minimumCGPA} onChange={(event) => setOpportunityForm({ ...opportunityForm, minimumCGPA: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <input type="number" min="0" placeholder="Maximum backlogs" value={opportunityForm.maximumBacklogs} onChange={(event) => setOpportunityForm({ ...opportunityForm, maximumBacklogs: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <input placeholder="Required skills, comma separated" value={opportunityForm.requiredSkills} onChange={(event) => setOpportunityForm({ ...opportunityForm, requiredSkills: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <input placeholder="Eligible departments, comma separated" value={opportunityForm.eligibleDepartments} onChange={(event) => setOpportunityForm({ ...opportunityForm, eligibleDepartments: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          <textarea placeholder="Opportunity description" value={opportunityForm.description} onChange={(event) => setOpportunityForm({ ...opportunityForm, description: event.target.value })} className="min-h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm md:col-span-2" />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 font-bold text-white md:col-span-2">Publish opportunity</button>
        </form>}
        {opportunities.length > 0 && <div className="mt-6 grid gap-2 md:grid-cols-2">{opportunities.slice(0, 6).map((job) => <div key={job._id} className="rounded-lg border border-gray-100 bg-gray-50 p-3"><p className="font-semibold text-gray-800">{job.title}</p><p className="text-sm text-gray-500">{job.companyId?.companyName || 'Company'} · {job.location || 'Location pending'}</p><span className="text-xs font-bold text-emerald-700">{job.status}</span></div>)}</div>}
      </Card>

      {actionMessage && <p className="mt-6 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">{actionMessage}</p>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Student Verification Queue</h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{pendingStudents.length} pending</span>
          </div>
          {pendingStudents.length === 0 ? <p className="text-sm text-gray-500">No pending student registrations.</p> : pendingStudents.map((student) => (
            <div key={student._id} className="flex items-center justify-between gap-3 border-b border-gray-100 py-3 last:border-0">
              <div><p className="font-semibold text-gray-800">{student.userId?.name || 'Student'}</p><p className="text-xs text-gray-500">{student.userId?.email} · {student.department || 'Academic details pending'}</p></div>
              <div className="flex gap-2"><button type="button" onClick={() => updateVerification(student.userId?._id, 'approved')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">Approve</button><button type="button" onClick={() => updateVerification(student.userId?._id, 'rejected')} className="rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700">Reject</button></div>
            </div>
          ))}
        </Card>

        <Card>
          <h2 className="text-2xl font-bold mb-4">Create Placement Incharge</h2>
          <form onSubmit={createIncharger} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[["name", "Full name"], ["username", "Username"], ["email", "Email"], ["password", "Temporary password"]].map(([field, label]) => <input key={field} required value={inchargerForm[field]} type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} placeholder={label} onChange={(event) => setInchargerForm({ ...inchargerForm, [field]: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />)}
            <button type="submit" className="sm:col-span-2 rounded-lg bg-primary px-4 py-2 font-bold text-white">Create incharge account</button>
          </form>
            <div className="mt-5 space-y-2"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Existing placement inchargers</p>{inchargers.length === 0 ? <p className="text-sm text-gray-500">None created yet.</p> : inchargers.map((incharger) => <div key={incharger._id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2 text-sm"><span><span className="block font-semibold text-gray-800">{incharger.name}</span><span className="text-gray-500">@{incharger.username}</span></span><button type="button" onClick={() => setDeleteInchargerTarget(incharger)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100">Delete</button></div>)}</div>
        </Card>
      </div>

          {deleteInchargerTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-bold text-gray-900">Delete placement incharge</h2><p className="mt-3 text-sm text-gray-600">Are you sure you want to delete this placement incharge account?</p><p className="mt-2 text-sm font-semibold text-gray-800">{deleteInchargerTarget.name} {deleteInchargerTarget.username ? `(@${deleteInchargerTarget.username})` : ''}</p><div className="mt-6 flex justify-end gap-3"><button type="button" disabled={deletingIncharger} onClick={() => setDeleteInchargerTarget(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700">Cancel</button><button type="button" disabled={deletingIncharger} onClick={deleteIncharger} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700">{deletingIncharger ? 'Deleting...' : 'Delete'}</button></div></div></div>}
    </motion.div>
  );
};

export default AdminDashboard;
