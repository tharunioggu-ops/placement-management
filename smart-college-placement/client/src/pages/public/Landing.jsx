import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import placementOfficeImage from '../../assets/why-choose-us-banner.svg';

const Landing = () => {
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = user?.role === 'tpo'
    ? '/tpo/dashboard'
    : user?.role === 'incharger'
      ? '/incharge/dashboard'
      : '/student/dashboard';

  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#fff7ed]">
      <div className="absolute inset-y-0 right-0 w-full bg-[radial-gradient(circle_at_78%_45%,rgba(249,115,22,0.24),transparent_28%),linear-gradient(105deg,#fff7ed_18%,rgba(255,247,237,0.78)_52%,rgba(254,215,170,0.45))]" />
      <motion.img
        initial={{ opacity: 0, scale: 1.08, x: 24 }}
        animate={{ opacity: 0.82, scale: 1, x: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        src={placementOfficeImage}
        alt="College placement office network"
        className="absolute right-[-16%] top-[8%] h-[78%] w-[68%] object-contain mix-blend-multiply sm:right-[-8%] sm:w-[58%] lg:right-[2%] lg:w-[52%]"
      />
      <div className="absolute right-[10%] top-[18%] h-[58%] w-[42%] rounded-[46%_54%_58%_42%] border border-orange-600/10 bg-orange-300/15 blur-2xl" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-6 py-16 sm:px-10 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-800">
            <ShieldCheck size={16} /> Internal college placement office
          </div>
          <h1 className="text-5xl font-black leading-[1.02] tracking-tight text-slate-900 sm:text-7xl">
            Your campus. Your placement desk.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600 sm:text-xl">
            Company requests arrive through the TPO, student profiles are verified by the placement team, and approved opportunities reach the right campus candidates.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            {isAuthenticated ? (
                <a href={dashboardPath} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 font-bold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-orange-700">
                Open workspace <ArrowRight size={18} />
              </a>
            ) : (
              <>
                <a href="/register" className="inline-flex items-center gap-2 rounded-xl border border-slate-900 px-6 py-3.5 font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-100">
                  Register now
                </a>
                <a href="/login" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 font-bold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-orange-700">
                  Student sign in <ArrowRight size={18} />
                </a>
                <a href="/tpo" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100">
                  TPO login
                </a>
              </>
            )}
          </div>
          <p className="mt-8 text-sm font-semibold text-slate-500">Verified academic records · College-approved opportunities · One internal workflow</p>
        </motion.div>
      </section>
    </main>
  );
};

export default Landing;
