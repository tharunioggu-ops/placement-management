import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { studentService } from '../../services';
import { LoadingSpinner, Card, EmptyState } from '../../components';
import { Briefcase } from 'lucide-react';

export const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await studentService.getProfile();
      const appsRes = await studentService.getApplications();
      setProfile(profileRes.data.studentProfile);
      setApplications(appsRes.data.applications);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
  const profileFields = [
    profile?.userId?.name,
    profile?.userId?.phone,
    profile?.department,
    profile?.course,
    profile?.year,
    profile?.cgpa > 0 ? profile.cgpa : null,
    profile?.education?.length > 0 ? profile.education : null,
    profile?.skills?.length > 0 ? profile.skills : null,
    profile?.resume,
  ];
  const profileCompletion = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  );
  const displayValue = (value) => value ?? 'Not provided';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Welcome, {displayValue(profile?.userId?.name)}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Profile Completion</p>
            <p className="text-3xl font-bold text-primary">{profileCompletion}%</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600">Applications</p>
            <p className="text-3xl font-bold text-primary">{applications.length}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600">Shortlisted</p>
            <p className="text-3xl font-bold text-secondary">{shortlistedCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600">Placement Status</p>
            <p className="text-3xl font-bold text-green-600">{displayValue(profile?.placementStatus)}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Academic Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Department:</span>
              <span className="font-semibold">{displayValue(profile?.department)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CGPA:</span>
              <span className="font-semibold">{profile?.cgpa > 0 ? profile.cgpa : 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Year:</span>
              <span className="font-semibold">{displayValue(profile?.year)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Backlogs:</span>
              <span className="font-semibold">{displayValue(profile?.backlogs)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
          <div className="space-y-3">
            <a href="/student/jobs" className="block p-3 bg-primary/10 text-primary rounded hover:bg-primary/20">
              Browse Jobs
            </a>
            <a href="/student/applications" className="block p-3 bg-secondary/10 text-secondary rounded hover:bg-secondary/20">
              My Applications
            </a>
            <a href="/student/profile" className="block p-3 bg-accent/10 text-accent rounded hover:bg-accent/20">
              Edit Profile
            </a>
            <a href="/student/ai-assistant" className="block p-3 bg-green-500/10 text-green-600 rounded hover:bg-green-500/20">
              AI Assistant
            </a>
          </div>
        </Card>
      </div>

      <Card className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Applications</h2>
        {applications.length === 0 ? (
          <EmptyState message="No applications yet" icon={Briefcase} />
        ) : (
          <div className="space-y-4">
            {applications.slice(0, 5).map(app => (
              <div key={app._id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="font-semibold">{app.jobId?.title}</p>
                  <p className="text-sm text-gray-600">{app.companyId?.companyName}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default StudentDashboard;
