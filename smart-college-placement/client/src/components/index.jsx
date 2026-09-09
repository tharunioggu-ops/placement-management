import React from 'react';
import { motion } from 'framer-motion';

export const Spinner = ({ size = 'md' }) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeMap[size]} border-4 border-gray-200 border-t-primary rounded-full`}
    />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
  );
};

export const Toast = ({ message, type = 'info', onClose }) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-gray-900',
    warning: 'bg-orange-500',
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${bgColor[type]} text-white px-4 py-3 rounded-lg shadow-lg`}
    >
      {message}
    </motion.div>
  );
};

export const Button = ({ children, onClick, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        {children}
      </motion.div>
    </motion.div>
  );
};

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

export const Badge = ({ children, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-orange-100 text-orange-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
};

export const EmptyState = ({ message = 'No data available', icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {Icon && <Icon size={48} className="text-gray-400 mb-4" />}
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );
};

export { default as JobHiringAnalytics } from './JobHiringAnalytics';
export { default as ResumeUploadCard } from './ResumeUploadCard';
export { default as CompanyStatsModal } from './CompanyStatsModal';
export { default as JobApplicationModal } from './JobApplicationModal';
export { default as CompanyAnalytics } from './CompanyAnalytics';
export { default as CompanyComparison } from './CompanyComparison';
