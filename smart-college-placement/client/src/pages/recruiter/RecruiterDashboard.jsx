import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { jobService, companyService, applicationService } from '../../services';
import { Card, LoadingSpinner, EmptyState } from '../../components';
import { Briefcase } from 'lucide-react';

export const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const jobsRes = await jobService.getRecruiterJobs();
      const companyRes = await companyService.getRecruiterCompany();
      setJobs(jobsRes.data.jobs || []);
      setCompany(companyRes.data.company);
      
      if (companyRes.data.company) {
        const appsRes = await applicationService.getRecruiterApplications(companyRes.data.company._id);
        setApplications(appsRes.data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const activeJobs = jobs.filter(j => j.status === 'Approved').length;
  const totalApplicants = applications.length;
  const shortlisted = applications.filter(a => a.status === 'Shortlisted').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Placement Incharge Dashboard</h1>

      {company && (
        <Card className="mb-8 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{company.companyName}</h2>
              <p className="text-sm opacity-90">{company.industry}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Status</p>
              <p className={company.isVerified ? 'text-green-300 font-bold' : 'text-yellow-300 font-bold'}>
                {company.isVerified ? '✓ Verified' : 'Pending Verification'}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Active Jobs</p>
            <p className="text-3xl font-bold text-primary">{activeJobs}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600">Total Applications</p>
            <p className="text-3xl font-bold text-secondary">{totalApplicants}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600">Shortlisted</p>
            <p className="text-3xl font-bold text-accent">{shortlisted}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600">Total Jobs</p>
            <p className="text-3xl font-bold text-green-600">{jobs.length}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">My Jobs</h2>
            <a href="/recruiter/jobs/create" className="text-primary font-semibold hover:underline">
              + Post Job
            </a>
          </div>
          {jobs.length === 0 ? (
            <EmptyState message="No jobs posted yet" icon={Briefcase} />
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 5).map(job => (
                <div key={job._id} className="border-l-4 border-primary pl-4 py-2">
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm text-gray-600">{job.location}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      job.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      job.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {job.status}
                    </span>
                    <a href={`/recruiter/jobs/${job._id}`} className="text-primary text-sm hover:underline">
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/recruiter/jobs/create" className="block p-3 bg-primary/10 text-primary rounded hover:bg-primary/20">
              Post New Job
            </a>
            <a href="/recruiter/applicants" className="block p-3 bg-secondary/10 text-secondary rounded hover:bg-secondary/20">
              View All Applications
            </a>
            <a href="/recruiter/company" className="block p-3 bg-accent/10 text-accent rounded hover:bg-accent/20">
              Edit Company Profile
            </a>
            <a href="/recruiter/analytics" className="block p-3 bg-green-500/10 text-green-600 rounded hover:bg-green-500/20">
              View Analytics
            </a>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default RecruiterDashboard;
