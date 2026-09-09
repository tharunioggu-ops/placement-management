import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import {
  Briefcase,
  FileText,
  CheckCircle,
  Users,
  Building,
  TrendingUp,
  Calendar,
  Filter,
  Layers,
  Sparkles,
  GitCompare,
  BarChart2,
  PhoneCall,
  UserCheck,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { CompanyAnalytics, CompanyComparison } from '../../components';

export const MonthlyReports = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const toast = {
    success: (msg) => addNotification(msg, 'success'),
    error: (msg) => addNotification(msg, 'error'),
    loading: (msg) => addNotification(msg, 'info'),
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = ['overview', 'company_analytics', 'compare'].includes(searchParams.get('tab')) ? searchParams.get('tab') : 'overview';
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview', 'company_analytics', 'compare'
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState('');

  // Date-range filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quickRange, setQuickRange] = useState('this_year'); // 'all', 'last_30', 'last_90', 'this_year', 'custom'

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('tab', tab);
      return next;
    });
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (['overview', 'company_analytics', 'compare'].includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = [currentYear, currentYear - 1, currentYear - 2];

  const handleQuickRangeSelect = (preset) => {
    setQuickRange(preset);
    const now = new Date();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      setSelectedMonth('');
    } else if (preset === 'last_30') {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      setStartDate(past30.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
      setSelectedMonth('');
    } else if (preset === 'last_90') {
      const past90 = new Date();
      past90.setDate(now.getDate() - 90);
      setStartDate(past90.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
      setSelectedMonth('');
    } else if (preset === 'this_year') {
      setStartDate(`${currentYear}-01-01`);
      setEndDate(`${currentYear}-12-31`);
      setSelectedYear(currentYear);
      setSelectedMonth('');
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = { year: selectedYear };
      if (selectedMonth) params.month = selectedMonth;
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await adminService.getMonthlyReports(params);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedYear, selectedMonth, startDate, endDate]);

  const StatCard = ({ icon: Icon, title, value, subtitle, colorClass, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between text-left"
    >
      <div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
          {title}
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-[11px] text-gray-500 mt-1 font-medium">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-2xl ${colorClass} shrink-0`}>
        <Icon size={22} />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white mb-8 shadow-xl relative overflow-hidden text-left">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={13} className="text-amber-400" />
                <span>Enterprise Placement Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Reports &amp; Analytics Dashboard
              </h1>
              <p className="text-sm text-indigo-200 mt-1.5 max-w-2xl">
                Real-time monthly hiring metrics, multi-company analytics, candidate funnel tracking, and enterprise comparison.
              </p>
            </div>

            {/* Quick Refresh Button */}
            <button
              onClick={fetchReports}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-2 self-start md:self-auto"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10 flex-wrap">
            <button
              onClick={() => changeTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart2 size={16} /> Monthly Reports &amp; KPIs
            </button>
            <button
              onClick={() => changeTab('company_analytics')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'company_analytics'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Building size={16} /> Selected Company Graphs
            </button>
            <button
              onClick={() => changeTab('compare')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'compare'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <GitCompare size={16} /> Compare Companies (2–4)
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & MONTHLY REPORTS */}
        {activeTab === 'overview' && (
          <div>
            {/* Filter Bar: Month Selector, Year Selector, Date-Range Pickers */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-400 uppercase mr-1">Quick Range:</span>
                <button
                  onClick={() => handleQuickRangeSelect('this_year')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    quickRange === 'this_year'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Year
                </button>
                <button
                  onClick={() => handleQuickRangeSelect('last_30')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    quickRange === 'last_30'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => handleQuickRangeSelect('last_90')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    quickRange === 'last_90'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Last 90 Days
                </button>
                <button
                  onClick={() => handleQuickRangeSelect('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    quickRange === 'all'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Time
                </button>
              </div>

              {/* Month / Year / Date Pickers */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Month selector */}
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setQuickRange('custom');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm"
                >
                  {months.map((m) => (
                    <option key={m.label} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>

                {/* Year selector */}
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(parseInt(e.target.value));
                    setQuickRange('custom');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                {/* Custom Date Pickers */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                  <Calendar size={14} className="text-gray-400 ml-1" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setQuickRange('custom');
                    }}
                    className="bg-transparent text-xs text-gray-700 font-bold focus:outline-none cursor-pointer"
                  />
                  <span>–</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setQuickRange('custom');
                    }}
                    className="bg-transparent text-xs text-gray-700 font-bold focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="h-80 flex items-center justify-center text-gray-400 text-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
                Aggregating monthly reports...
              </div>
            ) : !data ? (
              <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100">
                No report data found for this period.
              </div>
            ) : (
              <>
                {/* 7 Required Application / Job Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* 1. Total Applications */}
                  <StatCard
                    icon={FileText}
                    title="Total Applications"
                    value={data.summary.totalApplications}
                    subtitle="All candidate applications in range"
                    colorClass="bg-purple-50 text-purple-600"
                    delay={0.05}
                  />

                  {/* 2. Applications Submitted */}
                  <StatCard
                    icon={Briefcase}
                    title="Applications Submitted"
                    value={data.summary.applicationsSubmitted}
                    subtitle="Submitted and awaiting review"
                    colorClass="bg-indigo-50 text-indigo-600"
                    delay={0.1}
                  />

                  {/* 3. Shortlisted Applications */}
                  <StatCard
                    icon={CheckCircle}
                    title="Shortlisted Applications"
                    value={data.summary.shortlistedApplications}
                    subtitle="Cleared academic criteria"
                    colorClass="bg-amber-50 text-amber-600"
                    delay={0.15}
                  />

                  {/* 4. Interview Calls */}
                  <StatCard
                    icon={PhoneCall}
                    title="Interview Calls"
                    value={data.summary.interviewCalls}
                    subtitle="Technical & HR interview invites"
                    colorClass="bg-blue-50 text-blue-600"
                    delay={0.2}
                  />

                  {/* 5. Selected / Hired */}
                  <StatCard
                    icon={UserCheck}
                    title="Selected / Hired"
                    value={data.summary.selectedHired}
                    subtitle="Official placement offers issued"
                    colorClass="bg-emerald-50 text-emerald-600"
                    delay={0.25}
                  />

                  {/* 6. Rejected Applications */}
                  <StatCard
                    icon={XCircle}
                    title="Rejected Applications"
                    value={data.summary.rejectedApplications}
                    subtitle="Did not match drive benchmarks"
                    colorClass="bg-rose-50 text-rose-600"
                    delay={0.3}
                  />

                  {/* 7. Active Job Applications */}
                  <StatCard
                    icon={Clock}
                    title="Active Applications"
                    value={data.summary.activeApplications}
                    subtitle="Currently in ongoing hiring loops"
                    colorClass="bg-teal-50 text-teal-600"
                    delay={0.35}
                  />

                  {/* Bonus: Total Vacancies & Active Drives */}
                  <StatCard
                    icon={Building}
                    title="Total Vacancies"
                    value={`${data.summary.totalVacancies}+`}
                    subtitle={`${data.summary.activeJobs} active open positions`}
                    colorClass="bg-cyan-50 text-cyan-600"
                    delay={0.4}
                  />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 text-left">
                  {/* Monthly Applications Breakdown (Bar Chart) */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                        <FileText size={18} className="text-primary" />
                        Monthly Applications Breakdown
                      </h3>
                      <span className="text-xs text-gray-400 font-medium">12-Month Distribution</span>
                    </div>

                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.monthlyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <RechartsTooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                          <Bar dataKey="applications" name="Total Applications" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                          <Bar dataKey="shortlisted" name="Shortlisted" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                          <Bar dataKey="interviewCalls" name="Interview Calls" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Hiring Trends Progression (Area Chart) */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                        <TrendingUp size={18} className="text-emerald-500" />
                        Monthly Hiring &amp; Selections Velocity
                      </h3>
                      <span className="text-xs text-gray-400 font-medium">Offers Issued</span>
                    </div>

                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.monthlyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorHiredMonthly" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <RechartsTooltip
                            contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                          <Area type="monotone" dataKey="hired" name="Campus Recruits Hired" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHiredMonthly)" />
                          <Area type="monotone" dataKey="selected" name="Final Selections" stroke="#6366f1" strokeWidth={2} fillOpacity={0.2} fill="#6366f1" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>

                {/* Company-wise Hiring Comparison Vertical Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 text-left"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                        <Building size={18} className="text-primary" />
                        Enterprise Hiring Comparison ({selectedYear})
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Live total openings and hiring volume from registered placement records.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-primary bg-indigo-50 px-3 py-1 rounded-xl">
                      {data.companyHiringComparison.length} Enterprise Partners
                    </span>
                  </div>

                  <div className="h-[420px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.companyHiringComparison}
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis
                          dataKey="companyName"
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }}
                          width={110}
                        />
                        <RechartsTooltip
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                        <Bar dataKey="totalVacancies" name="Total Openings" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={18} />
                        <Bar dataKey="yearHired" name="Hiring Volume" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: SELECTED COMPANY GRAPHS */}
        {activeTab === 'company_analytics' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <CompanyAnalytics />
          </motion.div>
        )}

        {/* TAB 3: COMPANY COMPARISON */}
        {activeTab === 'compare' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <CompanyComparison />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReports;
