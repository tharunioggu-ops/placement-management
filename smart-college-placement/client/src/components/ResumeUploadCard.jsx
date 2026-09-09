import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Eye, 
  RefreshCw, 
  FileCheck,
  Download
} from 'lucide-react';
import { studentService } from '../services';

export const ResumeUploadCard = ({ 
  currentResume, 
  onResumeUpdated, 
  requiredWarning = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset messages
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side validation
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setErrorMessage('Unsupported file format. Please upload a PDF, DOC, or DOCX document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller resume.');
      return;
    }

    setUploading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      // Local preview mode for guest users
      const objectUrl = URL.createObjectURL(file);
      const guestResume = {
        url: objectUrl,
        originalName: file.name,
        size: file.size,
        mimeType: file.type || 'application/pdf',
        updatedAt: new Date().toISOString(),
        isLocalPreview: true,
      };
      setSuccessMessage('Resume attached successfully! (Ready to apply)');
      if (onResumeUpdated) {
        onResumeUpdated(guestResume);
      }
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await studentService.uploadResume(formData);
      setSuccessMessage('Resume uploaded and verified successfully!');
      if (onResumeUpdated) {
        onResumeUpdated(res.data.resume);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to upload resume. Please try again.'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveResume = async () => {
    if (!window.confirm('Are you sure you want to remove your active resume?')) {
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const token = localStorage.getItem('token');
    if (!token || currentResume?.isLocalPreview) {
      setSuccessMessage('Resume removed.');
      if (onResumeUpdated) {
        onResumeUpdated(null);
      }
      setUploading(false);
      return;
    }

    try {
      await studentService.deleteResume();
      setSuccessMessage('Resume removed successfully.');
      if (onResumeUpdated) {
        onResumeUpdated(null);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to remove resume. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Construct absolute URL for viewing/downloading if relative path
  const getResumeUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `http://localhost:5000${url}`;
  };

  const hasResume = Boolean(currentResume && currentResume.url);

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 transition-all border ${
        requiredWarning && !hasResume
          ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200'
          : hasResume
          ? 'bg-white border-emerald-200 shadow-sm'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Status & Details */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              hasResume
                ? 'bg-emerald-100 text-emerald-600'
                : requiredWarning
                ? 'bg-amber-100 text-amber-600'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {hasResume ? <FileCheck size={24} /> : <FileText size={24} />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-base">
                {hasResume ? 'Active Placement Resume' : 'Resume Required for Applications'}
              </h3>
              {hasResume && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Ready to Apply ✓
                </span>
              )}
              {requiredWarning && !hasResume && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900 animate-pulse">
                  Upload to Apply
                </span>
              )}
            </div>

            {hasResume ? (
              <div className="mt-1 text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-800 break-all">
                  {currentResume.originalName || 'My_Resume.pdf'}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{formatFileSize(currentResume.size)}</span>
                  <span>•</span>
                  <span className="uppercase font-semibold text-primary">
                    {currentResume.originalName?.split('.').pop() || 'PDF'}
                  </span>
                  {currentResume.updatedAt && (
                    <>
                      <span>•</span>
                      <span>
                        Updated {new Date(currentResume.updatedAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Upload your verified resume (PDF, DOC, or DOCX up to 10MB) to attach with your job applications.
              </p>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {hasResume ? (
            <>
              {/* View/Download Resume */}
              <a
                href={getResumeUrl(currentResume.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                <Eye size={14} /> View
              </a>

              {/* Replace Resume */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-50 text-primary hover:bg-indigo-100 transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={uploading ? 'animate-spin' : ''} /> Replace
              </button>

              {/* Remove Resume */}
              <button
                type="button"
                onClick={handleRemoveResume}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
              >
                <Trash2 size={14} /> Remove
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
            >
              <UploadCloud size={18} className={uploading ? 'animate-bounce' : ''} />
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          )}
        </div>
      </div>

      {/* Status Notifications */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-xs text-red-600 flex items-center gap-1.5 font-medium bg-red-50 p-2 rounded-lg"
          >
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-xs text-emerald-700 flex items-center gap-1.5 font-medium bg-emerald-50 p-2 rounded-lg"
          >
            <CheckCircle size={14} />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeUploadCard;
