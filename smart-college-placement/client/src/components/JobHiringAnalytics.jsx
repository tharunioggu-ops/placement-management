import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart2, 
  LineChart as LineChartIcon, 
  Building2, 
  Calendar, 
  Award, 
  Users, 
  Sparkles,
  Filter
} from 'lucide-react';
import { companyService } from '../services';

export const JobHiringAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [timePeriod, setTimePeriod] = useState('12m'); // '6m' or '12m'
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
  const [hoveredData, setHoveredData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    const refreshTimer = window.setInterval(fetchAnalytics, 30000);
    return () => window.clearInterval(refreshTimer);
  }, [selectedCompany, timePeriod]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await companyService.getHiringAnalytics({
        company: selectedCompany,
        period: timePeriod,
      });
      setAnalyticsData(res.data?.totalHired > 0 ? res.data : null);
    } catch (err) {
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const displayData = analyticsData || { trends: [], companies: [] };
  const trends = displayData.trends || [];
  const maxVal = Math.max(...trends.map((t) => t.totalHired), 10);

  // Calculate stats
  const totalHired = displayData.totalHired || 0;
  const peakMonth = displayData.peakMonth?.month || 'N/A';
  const peakCount = displayData.peakMonth?.count || 0;
  const avgMonthly = trends.length > 0 ? Math.round(totalHired / trends.length) : 0;
  const companyTotals = displayData.companies || [];
  const topCompany = [...companyTotals].sort((a, b) => b.totalHired - a.totalHired)[0];
  const maxCompanyTotal = Math.max(...companyTotals.map((company) => company.totalHired), 1);
  const totalCompanyHired = companyTotals.reduce((sum, company) => sum + company.totalHired, 0) || 1;
  const donutColors = ['#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#fb7185'];
  let donutOffset = 0;
  const donutSegments = companyTotals.map((company, index) => {
    const percentage = (company.totalHired / totalCompanyHired) * 100;
    const segment = `${donutColors[index % donutColors.length]} ${donutOffset}% ${donutOffset + percentage}%`;
    donutOffset += percentage;
    return { ...company, percentage, segment };
  });
  const donutBackground = `conic-gradient(${donutSegments.map((segment) => segment.segment).join(', ')})`;

  // SVG Chart Dimensions
  const chartHeight = 240;
  const chartWidth = 720;
  const paddingX = 45;
  const paddingY = 30;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  // Generate SVG points for the Line Chart
  const points = trends.map((item, idx) => {
    const x = paddingX + (idx / Math.max(trends.length - 1, 1)) * usableWidth;
    const y = chartHeight - paddingY - (item.totalHired / maxVal) * usableHeight;
    return { x, y, ...item };
  });

  // SVG Path for smooth Bezier curve
  const pathD = points.reduce((acc, point, idx, arr) => {
    if (idx === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[idx - 1];
    const cX1 = prev.x + (point.x - prev.x) / 2;
    const cY1 = prev.y;
    const cX2 = prev.x + (point.x - prev.x) / 2;
    const cY2 = point.y;
    return `${acc} C ${cX1} ${cY1}, ${cX2} ${cY2}, ${point.x} ${point.y}`;
  }, '');

  // Area under the curve
  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${
          chartHeight - paddingY
        } Z`
      : '';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-12">
      {/* Header with Title & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} className="text-amber-500" />
            <span>Interactive Placement Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Job Hiring Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Recruitment volume & monthly student hiring trends across leading campus partners.
          </p>
        </div>

        {/* Filters and Chart Type Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Company Filter Dropdown */}
          <div className="flex items-center bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-200">
            <Building2 size={16} className="text-gray-500 mr-2" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Companies</option>
              {companyTotals.map((company) => <option key={company.name} value={company.name}>{company.name}</option>)}
            </select>
          </div>

          {/* Time Period Filter */}
          <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200 text-xs font-bold">
            <button
              onClick={() => setTimePeriod('6m')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timePeriod === '6m'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimePeriod('12m')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timePeriod === '12m'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              12 Months
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
            <button
              onClick={() => setChartType('line')}
              title="Line Chart"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'line'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LineChartIcon size={17} />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Bar Chart"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'bar'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart2 size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="bg-gradient-to-br from-indigo-50/70 to-indigo-100/30 border border-indigo-100 rounded-2xl p-4">
          <div className="flex items-center justify-between text-primary mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Total Hired</span>
            <Users size={18} />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{totalHired}</p>
          <p className="text-xs text-gray-500 mt-1">Offers rolled out</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50/70 to-purple-100/30 border border-purple-100 rounded-2xl p-4">
          <div className="flex items-center justify-between text-secondary mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Peak Month</span>
            <TrendingUp size={18} />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{peakMonth}</p>
          <p className="text-xs text-gray-500 mt-1">{peakCount} selections in month</p>
        </div>

        <div className="bg-gradient-to-br from-pink-50/70 to-pink-100/30 border border-pink-100 rounded-2xl p-4">
          <div className="flex items-center justify-between text-accent mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-700">Avg Monthly</span>
            <Calendar size={18} />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{avgMonthly}</p>
          <p className="text-xs text-gray-500 mt-1">Average placements / mo</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50/70 to-emerald-100/30 border border-emerald-100 rounded-2xl p-4">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Top Recruiter</span>
            <Award size={18} />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{topCompany?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">{topCompany?.totalHired || 0} placements in period</p>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="relative bg-slate-900 rounded-2xl p-4 sm:p-6 overflow-hidden shadow-inner">
        {/* Subtle Chart Header Badge */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>{selectedCompany === 'All' ? 'Consolidated Campus Recruitment' : `${selectedCompany} Hiring Volume`}</span>
          <span className="font-semibold text-emerald-400">● Live Dynamic DB Data</span>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
            Loading recruitment analytics...
          </div>
        ) : trends.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            No recruitment data available
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[540px]">
              {chartType === 'line' ? (
                /* LINE CHART VIEW */
                <div className="relative">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-64 overflow-visible"
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="lineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Guideline Grids */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = chartHeight - paddingY - ratio * usableHeight;
                      const val = Math.round(ratio * maxVal);
                      return (
                        <g key={i}>
                          <line
                            x1={paddingX}
                            y1={y}
                            x2={chartWidth - paddingX}
                            y2={y}
                            stroke="#334155"
                            strokeDasharray="4 4"
                            strokeWidth="1"
                          />
                          <text
                            x={paddingX - 10}
                            y={y + 4}
                            fill="#94a3b8"
                            fontSize="10"
                            textAnchor="end"
                            fontFamily="monospace"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Shaded Area Under Curve */}
                    <path d={areaD} fill="url(#chartGradient)" />

                    {/* Smooth Spline Curve Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#lineStroke)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Interactive Points on Line */}
                    {points.map((pt, idx) => (
                      <g
                        key={idx}
                        className="cursor-pointer group"
                        onMouseEnter={() => setHoveredData(pt)}
                        onMouseLeave={() => setHoveredData(null)}
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="6"
                          fill="#0f172a"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          className="transition-transform duration-200 group-hover:scale-150"
                        />
                        <circle cx={pt.x} cy={pt.y} r="2.5" fill="#ffffff" />
                        {/* Month label along X axis */}
                        <text
                          x={pt.x}
                          y={chartHeight - 8}
                          fill="#cbd5e1"
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="500"
                        >
                          {pt.month.split(' ')[0]}
                        </text>
                      </g>
                    ))}
                  </svg>

                  {/* Floating Tooltip card */}
                  {hoveredData && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-2 right-4 bg-slate-800/95 border border-indigo-400/30 rounded-xl p-3 shadow-xl backdrop-blur-md text-left z-20 pointer-events-none"
                    >
                      <p className="text-xs text-indigo-300 font-bold uppercase">{hoveredData.month}</p>
                      <p className="text-xl font-black text-white">
                        {hoveredData.totalHired} <span className="text-xs font-normal text-slate-300">Students Hired</span>
                      </p>
                      {hoveredData.byCompany && Object.keys(hoveredData.byCompany).length > 0 && (
                        <div className="mt-1 pt-1 border-t border-slate-700/60 space-y-0.5">
                          {Object.entries(hoveredData.byCompany).map(([cName, cnt]) => (
                            <div key={cName} className="flex items-center justify-between text-[11px] text-slate-300 gap-4">
                              <span>{cName}:</span>
                              <span className="font-bold text-white">{cnt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ) : (
                /* BAR CHART VIEW */
                <div className="relative h-64 flex items-end justify-between pt-6 px-4">
                  {trends.map((item, idx) => {
                    const heightPercent = Math.max((item.totalHired / maxVal) * 100, 4);
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center group relative cursor-pointer px-1.5"
                        onMouseEnter={() => setHoveredData(item)}
                        onMouseLeave={() => setHoveredData(null)}
                      >
                        {/* Value above bar */}
                        <span className="text-[10px] text-slate-300 font-bold mb-1 opacity-80 group-hover:opacity-100 group-hover:text-cyan-300">
                          {item.totalHired}
                        </span>

                        {/* The animated vertical Bar */}
                        <div className="w-full max-w-[36px] bg-slate-800 rounded-t-xl overflow-hidden h-44 flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.03 }}
                            className="w-full bg-gradient-to-t from-primary via-secondary to-accent rounded-t-lg group-hover:brightness-125 transition-all shadow-lg"
                          />
                        </div>

                        {/* Month label */}
                        <span className="text-[10px] text-slate-400 font-medium mt-2">
                          {item.month.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}

                  {/* Floating Tooltip for Bar Chart */}
                  {hoveredData && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-2 right-4 bg-slate-800/95 border border-indigo-400/30 rounded-xl p-3 shadow-xl backdrop-blur-md text-left z-20 pointer-events-none"
                    >
                      <p className="text-xs text-indigo-300 font-bold uppercase">{hoveredData.month}</p>
                      <p className="text-xl font-black text-white">
                        {hoveredData.totalHired} <span className="text-xs font-normal text-slate-300">Students Hired</span>
                      </p>
                      {hoveredData.byCompany && Object.keys(hoveredData.byCompany).length > 0 && (
                        <div className="mt-1 pt-1 border-t border-slate-700/60 space-y-0.5">
                          {Object.entries(hoveredData.byCompany).map(([cName, cnt]) => (
                            <div key={cName} className="flex items-center justify-between text-[11px] text-slate-300 gap-4">
                              <span>{cName}:</span>
                              <span className="font-bold text-white">{cnt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && trends.length > 0 && companyTotals.length > 0 && (
          <div className="mt-5 grid lg:grid-cols-5 gap-5 rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Company comparison</p>
                <p className="text-xs text-slate-400 mt-1">Total hiring volume by company</p>
              </div>
              <BarChart2 size={18} className="text-slate-400" />
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {companyTotals.map((company, index) => (
                <div key={company.name} className="group">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">{company.name}</span>
                    <span className="font-bold text-cyan-300">{company.totalHired}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(company.totalHired / maxCompanyTotal) * 100}%` }}
                      transition={{ duration: 0.6, delay: index * 0.08 }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 group-hover:from-emerald-400 group-hover:to-cyan-400"
                    />
                  </div>
                </div>
              ))}
            </div>
            </div>
            <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-5">
              <p className="text-xs font-bold uppercase tracking-wider text-pink-300">Hiring share</p>
              <p className="text-xs text-slate-400 mt-1">Percentage of students hired by company</p>
              <div className="flex items-center gap-5 mt-4">
                <div className="relative w-32 h-32 rounded-full shrink-0" style={{ background: donutBackground }} title="Hiring share by company">
                  <div className="absolute inset-5 rounded-full bg-slate-950 flex items-center justify-center">
                    <span className="text-center text-[10px] text-slate-400">Total<br /><strong className="text-lg text-white">{totalCompanyHired}</strong></span>
                  </div>
                </div>
                <div className="space-y-1.5 min-w-0">
                  {donutSegments.map((company, index) => (
                    <div key={company.name} className="flex items-center gap-2 text-[11px] text-slate-300" title={`${company.name}: ${company.totalHired} hired`}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: donutColors[index % donutColors.length] }} />
                      <span className="truncate">{company.name}</span>
                      <strong className="ml-auto text-white">{Math.round(company.percentage)}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobHiringAnalytics;
