import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { studentService, applicationService } from '../../services';
import { Card, LoadingSpinner, EmptyState } from '../../components';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await studentService.getApplications();
      setApplications(res.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statusSteps = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected'];
  
  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(a => a.status === filter);

  const getStatusIcon = (status) => {
    if (status === 'Selected') return <CheckCircle className="text-green-600" size={24} />;
    if (status === 'Rejected') return <AlertCircle className="text-red-600" size={24} />;
    return <Clock className="text-yellow-600" size={24} />;
  };

  const getStatusIndex = (status) => {
    return statusSteps.indexOf(status);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Application Tracking</h1>

      <div className="flex gap-4 mb-8">
        {['all', 'Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === s
                ? 'bg-primary text-white'
                : 'bg-white border-2 border-gray-200 text-gray-800 hover:border-primary'
            }`}
          >
            {s === 'all' ? 'All Applications' : s}
            {s !== 'all' && ` (${applications.filter(a => a.status === s).length})`}
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <EmptyState message="No applications found" />
      ) : (
        <div className="space-y-6">
          {filteredApplications.map(app => (
            <motion.div
              key={app._id}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{app.jobId?.title}</h2>
                  <p className="text-lg text-gray-600">{app.companyId?.companyName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(app.status)}
                  <span className={`px-4 py-2 rounded-full font-bold ${
                    app.status === 'Selected' ? 'bg-green-100 text-green-800' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-600">Application Progress:</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusSteps.map((step, idx) => (
                    <React.Fragment key={step}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                        idx <= getStatusIndex(app.status)
                          ? 'bg-primary text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {idx + 1}
                      </div>
                      {idx < statusSteps.length - 1 && (
                        <div className={`flex-1 h-1 ${
                          idx < getStatusIndex(app.status)
                            ? 'bg-primary'
                            : 'bg-gray-300'
                        }`}></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <p className="text-gray-600 text-sm">Applied On</p>
                  <p className="font-semibold">{new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>

                {app.interviewDate && (
                  <div>
                    <p className="text-gray-600 text-sm">Interview Date</p>
                    <p className="font-semibold">{new Date(app.interviewDate).toLocaleDateString()}</p>
                  </div>
                )}

                {app.interviewMode && (
                  <div>
                    <p className="text-gray-600 text-sm">Interview Mode</p>
                    <p className="font-semibold">{app.interviewMode}</p>
                  </div>
                )}

                {app.remarks && (
                  <div>
                    <p className="text-gray-600 text-sm">Remarks</p>
                    <p className="font-semibold text-sm">{app.remarks}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default StudentApplications;
