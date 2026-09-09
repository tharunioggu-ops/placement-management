import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { BarChart2, Menu, X } from 'lucide-react';
import ProfileDropdown from '../components/ProfileDropdown';

export const Navbar = () => {
  const { user, isAuthenticated } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className="bg-[#111827]/95 backdrop-blur-md shadow-lg shadow-orange-950/10 border-b border-orange-400/20 sticky top-0 z-40"
    >
      <div className="container mx-auto px-4 py-3.5 flex justify-between items-center">
        {/* Logo & Platform Name */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-orange-950/30 group-hover:rotate-6 transition-transform">
            <span className="text-lg font-black">S</span>
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Smart<span className="text-orange-400">Placement</span>
          </span>
        </a>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-300">
          <a href="/" className="hover:text-orange-400 transition-colors">
            Home
          </a>
          {isAuthenticated && user?.role === 'tpo' && (
            <a
              href="/tpo/reports"
              className="hover:text-orange-400 transition-colors flex items-center gap-1.5"
            >
              <BarChart2 size={15} className="text-orange-400" />
              Reports & Analytics
            </a>
          )}
          {isAuthenticated && user?.role === 'tpo' && (
            <a href="/tpo/candidates" className="hover:text-orange-400 transition-colors">
              Student Verification
            </a>
          )}
        </div>

        {/* Right Auth CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <a href="/login" className="px-5 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl shadow-sm transition">
                Student Sign In
              </a>
              <a
                href="/tpo"
                className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-orange-600 rounded-xl shadow-md shadow-orange-950/20 transition"
              >
                TPO Login
              </a>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:bg-white/10 rounded-lg transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-gray-950 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              <a href="/" className="block text-gray-300 font-medium hover:text-orange-400">Home</a>
              {isAuthenticated && user?.role === 'tpo' && (
                <a href="/tpo/reports" className="block text-gray-600 font-medium hover:text-primary">Placement Reports</a>
              )}
              {isAuthenticated && user?.role === 'tpo' && (
                <a href="/tpo/candidates" className="block text-gray-600 font-medium hover:text-primary">Student Verification</a>
              )}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <a href="/register" className="flex-1 text-center px-4 py-2 text-sm font-bold text-primary border border-primary bg-white rounded-xl">Register</a>
                  <a href="/login" className="flex-1 text-center px-4 py-2 text-sm font-bold text-white bg-primary rounded-xl">Sign In</a>
                  <a href="/tpo" className="flex-1 text-center px-4 py-2 text-sm font-bold text-slate-900 border border-slate-300 bg-white rounded-xl">TPO Login</a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
