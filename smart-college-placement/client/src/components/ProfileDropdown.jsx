import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Settings, FileText, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const avatarUrl = user?.profileImage
    ? `http://localhost:5000${user.profileImage}`
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Profile & Settings"
        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full hover:bg-gray-100/90 border border-gray-200/80 transition focus:outline-none shadow-sm"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-sm overflow-hidden ring-2 ring-primary/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-gray-800 leading-none truncate max-w-[100px]">
            {user?.name?.split(' ')[0] || 'User'}
          </span>
          <span className="text-[10px] text-gray-400 capitalize">{user?.role || 'Student'}</span>
        </div>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
              {user?.location && (
                <p className="text-[11px] text-gray-400 truncate mt-1">📍 {user.location}</p>
              )}
              {user?.role === 'student' && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/student/profile?edit=true');
                  }}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Settings size={13} /> Edit Profile
                </button>
              )}
            </div>

            {/* Links */}
            <div className="p-2 space-y-1">
              {user?.role === 'student' && (
                <>
                  <button
                    onClick={() => { setIsOpen(false); navigate('/student/dashboard'); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl transition"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); navigate('/student/profile'); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl transition"
                  >
                    <User size={16} />
                    My Profile
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); navigate('/student/reports'); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl transition"
                  >
                    <FileText size={16} />
                    Reports & Analytics
                  </button>
                </>
              )}
              {user?.role === 'incharger' && (
                <>
                  <button
                    onClick={() => { setIsOpen(false); navigate('/incharge/dashboard'); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl transition"
                  >
                    <LayoutDashboard size={16} />
                    Incharge Panel
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
