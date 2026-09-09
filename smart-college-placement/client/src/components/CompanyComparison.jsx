import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import {
  Building2,
  GitCompare,
  Briefcase,
  Users,
  CheckCircle2,
  DollarSign,
  GraduationCap,
  Sparkles,
  Info,
} from 'lucide-react';
import { companyService } from '../services';

const COMPANY_COLORS = {
  0: '#4f46e5', // Indigo
  1: '#06b6d4', // Cyan
  2: '#10b981', // Emerald
  3: '#f59e0b', // Amber
};

export const CompanyComparison = () => {
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState('all');
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comparisonData, setComparisonData] = useState([]);
  const [metricsComparison, setMetricsComparison] = useState([]);
  const [hiringTrendsComparison, setHiringTrendsComparison] = useState([]);

  useEffect(() => {
    companyService.getAllCompanies()
      .then((res) => {
        const companies = (res.data.companies || []).map((company) => company.companyName).filter(Boolean);
        setAvailableCompanies(companies);
        setSelectedCompanies(companies.slice(0, 4));
      })
      .catch(() => {
        setError('Unable to load companies for comparison.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchComparison();
    const refreshTimer = window.setInterval(fetchComparison, 30000);
    return () => window.clearInterval(refreshTimer);
  }, [selectedCompanies, year, month, jobRole]);

  const fetchComparison = async () => {
    if (selectedCompanies.length === 0) {
      setComparisonData([]);
      setMetricsComparison([]);
      setHiringTrendsComparison([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await companyService.compareCompanies({
        companies: selectedCompanies.join(','), year, month, jobRole,
      });
      if (res.data.success) {
        setComparisonData(res.data.companies || []);
        setMetricsComparison(res.data.metricsComparison || []);
        setHiringTrendsComparison(res.data.hiringTrendsComparison || []);
      }
    } catch (err) {
      console.error('Failed to fetch comparison data:', err);
      setError('Unable to load recruitment analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompany = (companyName) => {
    if (selectedCompanies.includes(companyName)) {
      if (selectedCompanies.length <= 2) {
        alert('Please keep at least 2 companies selected for comparison.');
        return;
      }
      setSelectedCompanies(selectedCompanies.filter((c) => c !== companyName));
    } else {
      if (selectedCompanies.length >= 4) {
        alert('You can select a maximum of 4 companies to compare.');
        return;
      }
      setSelectedCompanies([...selectedCompanies, companyName]);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-12 text-left">
      {/* Header and Company Multi-Select */}
      <div className="pb-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <GitCompare size={13} className="text-primary" />
              <span>Side-by-Side Enterprise Evaluation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Compare Companies (2–4 Selected)
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Select 2 to 4 software companies to evaluate live job openings, application volumes, shortlisted ratios, and hiring trends.
            </p>
          </div>

          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl shrink-0 self-start md:self-auto">
            {selectedCompanies.length} of 4 Selected
          </span>
        </div>

        {/* Company Toggle Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {availableCompanies.map((comp) => {
            const isSelected = selectedCompanies.includes(comp);
            return (
              <button
                key={comp}
                onClick={() => handleToggleCompany(comp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{comp}</span>
                {isSelected && <span className="text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 py-4">
        <label className="text-xs font-bold text-gray-500">Year <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="ml-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-800"><option>{new Date().getFullYear()}</option><option>{new Date().getFullYear() - 1}</option><option>{new Date().getFullYear() - 2}</option></select></label>
        <label className="text-xs font-bold text-gray-500">Month <select value={month} onChange={(event) => setMonth(event.target.value)} className="ml-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-800"><option value="all">All months</option>{Array.from({ length: 12 }, (_, index) => <option key={index} value={index + 1}>{new Date(2000, index, 1).toLocaleString('en-US', { month: 'long' })}</option>)}</select></label>
        <label className="text-xs font-bold text-gray-500">Job role <input value={jobRole} onChange={(event) => setJobRole(event.target.value)} placeholder="Search role" className="ml-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm font-normal text-gray-800" /></label>
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center text-gray-400 text-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
          Analyzing comparative metrics...
        </div>
      ) : error ? (
        <div className="mt-8 rounded-xl bg-rose-50 p-8 text-center text-sm font-semibold text-rose-700">{error}</div>
      ) : comparisonData.length === 0 ? (
        <div className="mt-8 rounded-xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">No recruitment data available</div>
      ) : (
        <div className="mt-8">
          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {comparisonData.map((comp, idx) => (
              <motion.div
                key={comp._id || idx}
                whileHover={{ y: -3 }}
                className="bg-gray-50/60 rounded-2xl p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Logo & Company Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white p-2 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                      {comp.logo ? (
                        <img src={comp.logo} alt={comp.companyName} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 size={24} className="text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-base sm:text-lg leading-snug">
                        {comp.companyName}
                      </h3>
                      <span className="text-[11px] font-semibold text-gray-500 block truncate">
                        {comp.location || 'India'}
                      </span>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100">
                      <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                        <Briefcase size={13} className="text-indigo-600" /> Openings
                      </span>
                      <span className="font-black text-indigo-900 text-sm">{comp.totalVacancies}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100">
                      <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                        <Users size={13} className="text-purple-600" /> Applications
                      </span>
                      <span className="font-black text-purple-900 text-sm">{comp.totalApplications}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100">
                      <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 size={13} className="text-emerald-600" /> Shortlisted
                      </span>
                      <span className="font-black text-emerald-900 text-sm">{comp.totalShortlisted}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100">
                      <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                        <Users size={13} className="text-cyan-600" /> Total Hired
                      </span>
                      <span className="font-black text-cyan-900 text-sm">{comp.totalHired}+</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100">
                      <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                        <DollarSign size={13} className="text-amber-600" /> Package
                      </span>
                      <span className="font-bold text-gray-800 text-xs truncate max-w-[110px]">{comp.topPackage}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100">
                      <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                        <GraduationCap size={13} className="text-rose-600" /> Min CGPA
                      </span>
                      <span className="font-bold text-gray-800">{comp.minimumCGPA}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200/80 text-[11px] text-gray-500">
                  <span className="font-bold text-gray-700">Interview Venue:</span>{' '}
                  <span className="truncate block">{comp.interviewVenue}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Grouped Bar Chart Comparing Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-primary" />
                Key Recruitment Metrics Comparison
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <RechartsTooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    {selectedCompanies.map((cName, idx) => (
                      <Bar
                        key={cName}
                        dataKey={cName}
                        fill={COMPANY_COLORS[idx % 4]}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={28}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparative Hiring Velocity Trends Line Chart */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                Monthly Hiring Trend Progression
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hiringTrendsComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    {selectedCompanies.map((cName, idx) => (
                      <Line
                        key={cName}
                        type="monotone"
                        dataKey={cName}
                        stroke={COMPANY_COLORS[idx % 4]}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyComparison;
