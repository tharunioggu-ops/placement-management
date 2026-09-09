import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Briefcase, 
  Building2, 
  MapPin, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Send,
  Sparkles
} from 'lucide-react';
import ResumeUploadCard from './ResumeUploadCard';
import { applicationService } from '../services';

export const JobApplicationModal = ({ 
  job, 
  currentResume, 
  onResumeUpdated, 
  onClose, 
  onApplicationSuccess 
}) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!job) return null;

  const hasResume = Boolean(currentResume && currentResume.url);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasResume) {
      setErrorMessage('Please upload and verify your resume before submitting the application.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      await applicationService.createApplication({
        jobId: job._id,
        resume: currentResume.url,
        coverLetter,
      });
      setAppliedSuccess(true);
      if (onApplicationSuccess) {
        onApplicationSuccess(job._id);
      }
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to submit application. Please check your eligibility and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-primary via-indigo-600 to-secondary text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Briefcase size={22} className="text-white" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-100">
                  Job Application
                </span>
                <h2 className="text-xl font-black">{job.title}</h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {appliedSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Application Submitted!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Your profile and verified resume have been successfully forwarded to{' '}
                  <span className="font-bold text-gray-900">
                    {job.companyId?.companyName || 'the recruiter'}
                  </span>.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Job Summary Pill Box */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-left">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {job.companyId?.companyName}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-primary">
                      {job.vacancies || 1} Open Vacancies
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-primary" /> {job.location || 'Pan India'}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-700">{job.salary || 'Competitive'}</span>
                    <span>•</span>
                    <span>{job.workMode || 'Hybrid'}</span>
                    <span>•</span>
                    <span>Min CGPA: {job.minimumCGPA || 0}</span>
                  </div>
                </div>

                {/* Resume Section with Embedded Upload / Management */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Required Candidate Resume <span className="text-red-500">*</span>
                  </label>

                  <ResumeUploadCard
                    currentResume={currentResume}
                    onResumeUpdated={onResumeUpdated}
                    requiredWarning={!hasResume}
                  />

                  {!hasResume && (
                    <p className="text-xs text-amber-700 font-semibold mt-2 flex items-center gap-1">
                      <AlertCircle size={14} /> You must upload your resume before submitting this application.
                    </p>
                  )}
                </div>

                {/* Cover Letter / Note to Recruiter */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Note / Cover Letter <span className="text-xs text-gray-400 normal-case font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Highlight your key technical skills, relevant projects, and interest in this role..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!hasResume || submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20 transition-all"
                  >
                    <Send size={16} />
                    {submitting ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default JobApplicationModal;
