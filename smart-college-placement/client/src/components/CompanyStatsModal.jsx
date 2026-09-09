import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  MapPin,
  Briefcase,
  Users,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Globe,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
  DollarSign,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { companyService } from '../services';

export const CompanyStatsModal = ({ companyId, onClose, onSelectJobToApply }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      const res = await companyService.getCompanyStats(companyId);
      setData(res.data.company);
    } catch (err) {
      console.error('Error fetching company details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!companyId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        >
          {/* Modal Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between relative shrink-0">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-lg shrink-0 overflow-hidden border border-white/20">
                {data?.logo ? (
                  <img src={data.logo} alt={data.companyName} className="w-full h-full object-contain" />
                ) : (
                  <Building2 size={32} className="text-primary" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{data?.companyName || 'Company Profile'}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Verified Campus Partner
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-indigo-200 mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Globe size={13} className="text-primary" /> {data?.industry || 'Enterprise Technology'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-rose-400" /> {data?.location || 'India'}
                  </span>
                  {data?.website && (
                    <>
                      <span>•</span>
                      <a
                        href={data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline inline-flex items-center gap-1 text-cyan-300 font-semibold"
                      >
                        Official Website <ExternalLink size={11} />
                      </a>
                    </>
                  )}
                  {data?.registrationLink && (
                    <>
                      <span>•</span>
                      <a
                        href={data.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline inline-flex items-center gap-1 text-amber-300 font-semibold"
                      >
                        Registration Form <ExternalLink size={11} />
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-grow text-left">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
                Loading detailed company information...
              </div>
            ) : (
              <>
                {/* 4 Stat Overview Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4">
                    <span className="text-[11px] font-bold uppercase text-indigo-700 block">Open Vacancies</span>
                    <p className="text-2xl font-black text-indigo-950 mt-0.5">{data?.totalVacancies} Roles</p>
                    <span className="text-[10px] text-indigo-600 font-semibold">Active enterprise drive</span>
                  </div>

                  <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4">
                    <span className="text-[11px] font-bold uppercase text-purple-700 block">Job Openings</span>
                    <p className="text-2xl font-black text-purple-950 mt-0.5">{data?.jobsPosted} Positions</p>
                    <span className="text-[10px] text-purple-600 font-semibold">Listed on campus portal</span>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
                    <span className="text-[11px] font-bold uppercase text-emerald-700 block">Campus Recruits</span>
                    <p className="text-2xl font-black text-emerald-950 mt-0.5">{data?.hiringCount}+ Hired</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Historic successful offers</span>
                  </div>

                  <div className="bg-pink-50/70 border border-pink-100 rounded-2xl p-4">
                    <span className="text-[11px] font-bold uppercase text-pink-700 block">Work Model</span>
                    <p className="text-sm font-black text-pink-950 mt-1 truncate">
                      {data?.workModes?.join(', ') || 'Hybrid & On-site'}
                    </p>
                    <span className="text-[10px] text-pink-600 font-semibold">Flexible workplace</span>
                  </div>
                </div>

                {/* Company Description */}
                {data?.description && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      About {data.companyName}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                      {data.description}
                    </p>
                  </div>
                )}

                {/* Office Location & Interview Venue Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Address / Office Location */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Company Address / Office Location
                      </h4>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {data?.officeAddress || data?.fullAddress || data?.location || 'Corporate Headquarters'}
                      </p>
                      {data?.city && data?.state && (
                        <span className="text-xs text-amber-700 font-medium mt-0.5 block">
                          {data.city}, {data.state}, {data.country || 'India'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Interview Venue */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Compass size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                        Interview Venue &amp; Assessment Center
                      </h4>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {data?.interviewVenue || 'Campus Placement Auditorium / Virtual Meeting Room'}
                      </p>
                      <span className="text-xs text-blue-600 font-medium mt-0.5 block">
                        Direct on-campus drive &amp; technical loop
                      </span>
                    </div>
                  </div>
                </div>

                {/* Locations and Work Modes Badges */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Primary Hiring Hubs &amp; Work Model
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data?.jobLocations?.map((loc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200"
                      >
                        <MapPin size={12} className="text-primary" /> {loc}
                      </span>
                    ))}
                    {data?.workModes?.map((wm, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-primary border border-indigo-200"
                      >
                        ● {wm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available Job Roles List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Available Campus Job Roles ({data?.availableRoles?.length || 0})
                    </h3>
                    <span className="text-xs text-primary font-semibold">Active Recruitment Vacancies</span>
                  </div>

                  <div className="space-y-3.5">
                    {data?.availableRoles?.map((role) => (
                      <div
                        key={role._id}
                        className="p-5 rounded-2xl bg-gray-50 hover:bg-white border border-gray-200 hover:border-primary/40 transition-all shadow-sm"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <h4 className="font-bold text-gray-900 text-base sm:text-lg">{role.title}</h4>
                              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-primary">
                                {role.vacancies || 1} Openings
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-200 text-gray-700">
                                {role.jobType || 'Full Time'}
                              </span>
                            </div>

                            {role.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                                {role.description}
                              </p>
                            )}

                            {/* Required Skills Badges */}
                            {role.requiredSkills && role.requiredSkills.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                                <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Skills:</span>
                                {role.requiredSkills.map((sk, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-white text-gray-800 border border-gray-200"
                                  >
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Specs Bar */}
                            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                                Package: {role.salary || 'Competitive'}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={13} className="text-gray-400" /> {role.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <GraduationCap size={13} className="text-gray-400" /> Min CGPA: {role.minimumCGPA || 'None'}
                              </span>
                              {role.applicationDeadline && (
                                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                                  <Calendar size={13} /> Deadline: {new Date(role.applicationDeadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {/* Venue info for this role */}
                            <div className="mt-2.5 text-[11px] text-gray-500 flex items-center gap-1.5">
                              <Compass size={12} className="text-primary shrink-0" />
                              <span>
                                <strong>Venue:</strong> {role.interviewVenue || data?.interviewVenue || 'Auditorium Hall / Virtual Portal'}
                              </span>
                            </div>
                          </div>

                          {/* Apply Action Button */}
                          {onSelectJobToApply && (
                            <button
                              onClick={() => {
                                onClose();
                                onSelectJobToApply(role);
                              }}
                              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary/90 transition shadow-md shadow-primary/20 shrink-0 self-start lg:self-center"
                            >
                              Apply to Position <ArrowRight size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CompanyStatsModal;
