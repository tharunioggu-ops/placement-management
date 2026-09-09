import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './utils/ProtectedRoute';

// Pages
import Landing from './pages/public/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TpoLogin from './pages/auth/TpoLogin';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentJobs from './pages/student/StudentJobs';
import StudentApplications from './pages/student/StudentApplications';
import AIAssistant from './pages/student/AIAssistant';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import MonthlyReports from './pages/student/MonthlyReports';
import AdminDashboard from './pages/admin/AdminDashboard';
import Candidates from './pages/admin/Candidates';

// Layouts
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tpo" element={<TpoLogin />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={<ProtectedRoute requiredRole={['student']}><StudentDashboard /></ProtectedRoute>}
              />
              <Route
                path="/student/profile"
                element={<ProtectedRoute requiredRole={['student']}><StudentProfile /></ProtectedRoute>}
              />
              <Route
                path="/student/jobs"
                element={<ProtectedRoute requiredRole={['student']}><StudentJobs /></ProtectedRoute>}
              />
              <Route
                path="/student/applications"
                element={<ProtectedRoute requiredRole={['student']}><StudentApplications /></ProtectedRoute>}
              />
              <Route
                path="/student/ai-assistant"
                element={<ProtectedRoute requiredRole={['student']}><AIAssistant /></ProtectedRoute>}
              />

              {/* Placement Incharge Routes */}
              <Route
                path="/incharge/dashboard"
                element={<ProtectedRoute requiredRole={['incharger']}><RecruiterDashboard /></ProtectedRoute>}
              />

              <Route
                path="/tpo/dashboard"
                element={<ProtectedRoute requiredRole={['tpo']}><AdminDashboard /></ProtectedRoute>}
              />
              <Route
                path="/tpo/candidates"
                element={<ProtectedRoute requiredRole={['tpo']}><Candidates /></ProtectedRoute>}
              />
              <Route
                path="/tpo/reports"
                element={<ProtectedRoute requiredRole={['tpo']}><MonthlyReports /></ProtectedRoute>}
              />

              <Route path="/admin/*" element={<Navigate to="/tpo/dashboard" replace />} />

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
