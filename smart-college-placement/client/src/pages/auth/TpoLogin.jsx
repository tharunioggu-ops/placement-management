import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components';

const TpoLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addNotification } = useNotification();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      if (response.data.user.role !== 'tpo') {
        throw new Error('This account is not authorized as a TPO');
      }
      login(response.data.user, response.data.token);
      addNotification('TPO login successful', 'success');
      navigate('/tpo/dashboard');
    } catch (error) {
      addNotification(error.response?.data?.message || error.message || 'TPO login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <p className="text-xs font-bold uppercase tracking-wider text-primary text-center mb-2">Administration</p>
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">TPO Login</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Training and Placement Officer access</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90">
            {loading ? 'Signing in...' : 'Sign in as TPO'}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default TpoLogin;