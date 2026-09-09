import React, { useEffect, useState } from 'react';
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
import { BarChart2, LineChart as LineChartIcon, Sparkles, TrendingUp } from 'lucide-react';
import { companyService } from '../services';

const SERIES = [
  { key: 'jobOpenings', name: 'Job Openings', color: '#6366f1' },
  { key: 'applications', name: 'Applications', color: '#a855f7' },
  { key: 'shortlisted', name: 'Shortlisted Candidates', color: '#10b981' },
  { key: 'interviewOpportunities', name: 'Interviews', color: '#f59e0b' },
  { key: 'hired', name: 'Total Hired', color: '#06b6d4' },
];

const chartControls = [
  ['line', LineChartIcon, 'Line'],
  ['bar', BarChart2, 'Bar'],
  ['area', TrendingUp, 'Area'],
];

function ChartContent({ type, data }) {
  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis dataKey="monthShort" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
      <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
      <RechartsTooltip contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '14px' }} />
    </>
  );

  if (type === 'bar') {
    return <BarChart data={data}>{common}{SERIES.map((series) => <Bar key={series.key} dataKey={series.key} name={series.name} fill={series.color} radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive animationDuration={700} />)}</BarChart>;
  }
  if (type === 'area') {
    return <AreaChart data={data}>{common}{SERIES.map((series) => <Area key={series.key} type="monotone" dataKey={series.key} name={series.name} stroke={series.color} fill={series.color} fillOpacity={0.12} strokeWidth={2.5} isAnimationActive animationDuration={700} />)}</AreaChart>;
  }
  return <LineChart data={data}>{common}{SERIES.map((series) => <Line key={series.key} type="monotone" dataKey={series.key} name={series.name} stroke={series.color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} isAnimationActive animationDuration={700} />)}</LineChart>;
}

function CompanyProgressionChart({ company, chartType, setChartType }) {
  const hasData = company.trends.some((month) => SERIES.some((series) => Number(month[series.key]) > 0));

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-black text-gray-900">12-Month Progression for {company.name}</h3>
        <div className="flex rounded-xl border border-gray-200 bg-gray-100 p-1">
          {chartControls.map(([type, Icon, label]) => (
            <button key={type} type="button" title={`${label} chart`} onClick={() => setChartType(type)} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold ${chartType === type ? 'bg-white text-primary shadow-sm' : 'text-gray-600'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          ['Total Job Openings', company.company?.totalOpenings || 0, 'text-indigo-700', 'bg-indigo-50'],
          ['Total Applications', company.company?.totalApplications || 0, 'text-purple-700', 'bg-purple-50'],
          ['Total Shortlisted', company.company?.totalShortlisted || 0, 'text-emerald-700', 'bg-emerald-50'],
          ['Total Interviews', company.company?.totalInterviews || 0, 'text-amber-700', 'bg-amber-50'],
          ['Total Hired', company.company?.totalHired || 0, 'text-cyan-700', 'bg-cyan-50'],
        ].map(([label, value, textColor, background]) => <div key={label} className={`rounded-xl ${background} p-3`}><p className={`text-[10px] font-bold uppercase tracking-wide ${textColor}`}>{label}</p><p className="mt-1 text-xl font-black text-gray-900">{value}</p></div>)}
      </div>
      {company.error ? (
        <div className="flex h-[380px] items-center justify-center rounded-xl bg-rose-50 text-sm font-semibold text-rose-700">{company.error}</div>
      ) : !hasData ? (
        <div className="flex h-[380px] items-center justify-center rounded-xl bg-slate-50 text-sm font-semibold text-slate-500">No recruitment data available for this period</div>
      ) : (
        <div className="h-[380px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContent type={chartType} data={company.trends} />
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export const CompanyAnalytics = () => {
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [period, setPeriod] = useState('12-months');
  const [chartTypes, setChartTypes] = useState({});
  const [companyData, setCompanyData] = useState({});
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [error, setError] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  const loadCompanies = async () => {
    try {
      const response = await companyService.getAllCompanies();
      setAvailableCompanies((response.data.companies || []).filter((company) => company.companyName));
    } catch (requestError) {
      setError('Unable to load companies for analytics.');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadCompanyData = async () => {
    if (selectedCompanies.length === 0) {
      setCompanyData({});
      return;
    }
    setLoadingCharts(true);
    try {
      const entries = await Promise.all(selectedCompanies.map(async (companyName) => {
        try {
          const response = await companyService.getCompanyDetailedAnalytics(companyName, period);
          return [companyName, { name: companyName, trends: response.data.trends || [], company: response.data.company }];
        } catch (requestError) {
          return [companyName, { name: companyName, trends: [], error: requestError.response?.data?.message || 'Unable to load this company.' }];
        }
      }));
      setCompanyData(Object.fromEntries(entries));
    } finally {
      setLoadingCharts(false);
    }
  };

  useEffect(() => { loadCompanies(); }, []);
  useEffect(() => {
    loadCompanyData();
    const refreshTimer = window.setInterval(loadCompanyData, 30000);
    return () => window.clearInterval(refreshTimer);
  }, [selectedCompanies, period]);

  const toggleCompany = (companyName) => {
    setSelectedCompanies((current) => current.includes(companyName)
      ? current.filter((name) => name !== companyName)
      : [...current, companyName]);
  };

  const selectedData = selectedCompanies.map((name) => companyData[name]).filter(Boolean);
  const combinedTrends = selectedData[0]?.trends.map((month, index) => {
    const point = { monthShort: month.monthShort, month: month.month };
    selectedData.forEach((company) => { point[company.name] = company.trends[index]?.hired || 0; });
    return point;
  }) || [];
  const hasCombinedData = combinedTrends.some((month) => selectedCompanies.some((name) => Number(month[name]) > 0));

  return (
    <div className="mb-10 rounded-3xl border border-gray-100 bg-white p-6 text-left shadow-sm sm:p-8">
      <div className="border-b border-gray-100 pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary"><Sparkles size={13} /> Company Hiring Intelligence</div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">Company Recruitment Analytics</h2>
            <p className="mt-1 text-sm text-gray-500">Select any number of companies to generate independent live progression graphs.</p>
          </div>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-800">
            <option value="12-months">Last 12 Months</option><option value="6-months">Last 6 Months</option><option value="current-year">Current Year</option>
          </select>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {loadingCompanies ? <span className="text-sm text-gray-500">Loading companies...</span> : availableCompanies.map((company) => (
            <label key={company._id} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${selectedCompanies.includes(company.companyName) ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
              <input type="checkbox" checked={selectedCompanies.includes(company.companyName)} onChange={() => toggleCompany(company.companyName)} className="accent-primary" />{company.companyName}
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setShowComparison((current) => !current)} disabled={selectedCompanies.length < 2} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{showComparison ? 'Hide Comparison' : 'Compare All Selected Companies'}</button>
          <span className="text-xs font-semibold text-gray-500">{selectedCompanies.length} selected</span>
        </div>
      </div>
      {error ? <div className="mt-6 rounded-xl bg-rose-50 p-8 text-center text-sm font-semibold text-rose-700">{error}</div> : loadingCharts ? <div className="flex h-[380px] items-center justify-center text-sm text-gray-500"><span className="mr-3 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />Loading recruitment analytics...</div> : selectedCompanies.length === 0 ? <div className="mt-6 rounded-xl bg-slate-50 p-10 text-center text-sm font-semibold text-slate-500">Please select at least one company to view analytics.</div> : <div className="mt-6 space-y-6">
        {selectedData.map((company) => <CompanyProgressionChart key={company.name} company={company} chartType={chartTypes[company.name] || 'line'} setChartType={(type) => setChartTypes((current) => ({ ...current, [company.name]: type }))} />)}
        {showComparison && <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><h3 className="mb-5 text-lg font-black text-gray-900">Hiring Comparison for Selected Companies</h3>{!hasCombinedData ? <div className="flex h-[350px] items-center justify-center rounded-xl bg-slate-50 text-sm font-semibold text-slate-500">No recruitment data available for this period</div> : <div className="h-[380px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={combinedTrends}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="monthShort" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} allowDecimals={false} /><RechartsTooltip /><Legend />{selectedCompanies.map((companyName, index) => <Line key={companyName} type="monotone" dataKey={companyName} name={`${companyName} Hired`} stroke={['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 6]} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive animationDuration={700} />)}</LineChart></ResponsiveContainer></div>}</section>}
      </div>}
    </div>
  );
};

export default CompanyAnalytics;
