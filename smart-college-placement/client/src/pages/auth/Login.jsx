import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addNotification } = useNotification();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(identifier, password);
      const { user, token } = response.data;

      if (!['student', 'incharger', 'tpo'].includes(user.role)) {
        throw new Error('This account is not allowed to sign in here');
      }

      login(user, token);
      addNotification('Login successful', 'success');

      if (user.role === 'tpo') {
        navigate('/tpo/dashboard');
      } else if (user.role === 'incharger') {
        navigate('/incharge/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      addNotification(error.response?.data?.message || error.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <p className="text-xs font-bold uppercase tracking-wider text-primary text-center mb-2">Access portal</p>
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Sign In</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Student and placement incharge access</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student email or username</label>
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 pr-11 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default Login;
