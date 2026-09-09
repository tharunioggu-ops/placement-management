import React, { useEffect, useState } from 'react';
import { Search, X, Eye, Trash2 } from 'lucide-react';
import { adminService } from '../../services';
import { Card, LoadingSpinner } from '../../components';
import { useNotification } from '../../context/NotificationContext';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  const loadCandidates = async () => {
    try {
      const response = await adminService.getAllStudents();
      setCandidates(response.data.students || []);
    } catch (error) {
      addNotification(error.response?.data?.message || 'Unable to load candidates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCandidates(); }, []);

  const updateStatus = async (candidate, placementStatus) => {
    try {
      await adminService.updateCandidateStatus(candidate.userId?._id, placementStatus);
      setCandidates((items) => items.map((item) => item._id === candidate._id ? { ...item, placementStatus } : item));
      addNotification('Candidate status updated', 'success');
    } catch (error) {
      addNotification(error.response?.data?.message || 'Unable to update status', 'error');
    }
  };

  const deleteCandidate = async (candidate) => {
    if (!window.confirm(`Delete ${candidate.userId?.name || 'this candidate'}?`)) return;
    try {
      await adminService.deleteCandidate(candidate.userId?._id);
      setCandidates((items) => items.filter((item) => item._id !== candidate._id));
      addNotification('Candidate deleted', 'success');
    } catch (error) {
      addNotification(error.response?.data?.message || 'Unable to delete candidate', 'error');
    }
  };

  const filtered = candidates.filter((candidate) => {
    const name = candidate.userId?.name || '';
    const email = candidate.userId?.email || '';
    const matchesQuery = `${name} ${email} ${candidate.department || ''}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (statusFilter === 'all' || candidate.placementStatus === statusFilter);
  });

  if (loading) return <LoadingSpinner />;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div><h1 className="text-4xl font-bold text-gray-800">Registered Students</h1><p className="text-gray-500 mt-1">Review student registrations, academic details, verification, and placement status.</p></div>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="relative flex-1"><Search size={18} className="absolute left-3 top-3 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or department" className="w-full pl-10 pr-4 py-2.5 border rounded-lg" /></label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="border rounded-lg px-3"><option value="all">All statuses</option><option>Not Placed</option><option>Placed</option><option>Not Eligible</option></select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b text-sm text-gray-500"><th className="py-3">Student</th><th>Contact</th><th>Academic Details</th><th>Verification</th><th>Placement</th><th className="text-right">Actions</th></tr></thead><tbody>
          {filtered.map((candidate) => <tr key={candidate._id} className="border-b last:border-0"><td className="py-4"><p className="font-semibold">{candidate.userId?.name || 'Unnamed student'}</p><p className="text-sm text-gray-500">{candidate.college || 'College not provided'}</p></td><td><p className="text-sm">{candidate.userId?.email || 'Email not provided'}</p><p className="text-sm text-gray-500">{candidate.userId?.phone || 'Phone not provided'}</p></td><td><p>{candidate.department || 'Department pending'}</p><p className="text-sm text-gray-500">Year {candidate.year || '-'} · CGPA {candidate.cgpa ?? '-'}</p></td><td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${candidate.userId?.verificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : candidate.userId?.verificationStatus === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{candidate.userId?.verificationStatus || 'pending'}</span></td><td><select value={candidate.placementStatus || 'Not Placed'} onChange={(event) => updateStatus(candidate, event.target.value)} className="border rounded px-2 py-1 text-sm"><option>Not Placed</option><option>Placed</option><option>Not Eligible</option></select></td><td className="text-right"><div className="inline-flex items-center gap-3"><button onClick={() => setSelected(candidate)} className="inline-flex items-center gap-1 text-primary font-semibold"><Eye size={16} /> View</button><button onClick={() => deleteCandidate(candidate)} title="Delete student" className="text-red-600"><Trash2 size={16} /></button></div></td></tr>)}
        </tbody></table>{filtered.length === 0 && <p className="text-center text-gray-500 py-10">No candidates match your search.</p>}</div>
      </Card>

      {selected && <div className="fixed inset-0 z-50 bg-black/40 p-4 overflow-y-auto" onClick={() => setSelected(null)}><div className="max-w-xl mx-auto my-16 bg-white rounded-xl p-6" onClick={(event) => event.stopPropagation()}><div className="flex justify-between"><h2 className="text-2xl font-bold">Candidate Profile</h2><button onClick={() => setSelected(null)}><X /></button></div><div className="grid grid-cols-2 gap-4 mt-6 text-sm">{Object.entries(selected).filter(([key]) => !['_id', '__v', 'userId', 'createdAt', 'updatedAt', 'education', 'projects', 'internships'].includes(key)).map(([key, value]) => <div key={key}><p className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p><p className="font-semibold">{Array.isArray(value) ? value.join(', ') : String(value ?? 'Not provided')}</p></div>)}<div><p className="text-gray-500">Name</p><p className="font-semibold">{selected.userId?.name}</p></div><div><p className="text-gray-500">Email</p><p className="font-semibold">{selected.userId?.email}</p></div></div></div></div>}
      {selected && <div className="fixed inset-0 z-50 bg-black/40 p-4 overflow-y-auto" onClick={() => setSelected(null)}><div className="max-w-xl mx-auto my-16 bg-white rounded-xl p-6" onClick={(event) => event.stopPropagation()}><div className="flex justify-between"><div><h2 className="text-2xl font-bold">Student Details</h2><p className="text-sm text-gray-500">Submitted during student registration</p></div><button onClick={() => setSelected(null)}><X /></button></div><div className="grid grid-cols-2 gap-4 mt-6 text-sm"><div><p className="text-gray-500">Name</p><p className="font-semibold">{selected.userId?.name || 'Not provided'}</p></div><div><p className="text-gray-500">Email</p><p className="font-semibold">{selected.userId?.email || 'Not provided'}</p></div><div><p className="text-gray-500">Phone</p><p className="font-semibold">{selected.userId?.phone || 'Not provided'}</p></div><div><p className="text-gray-500">Verification</p><p className="font-semibold capitalize">{selected.userId?.verificationStatus || 'pending'}</p></div>{Object.entries(selected).filter(([key]) => !['_id', '__v', 'userId', 'createdAt', 'updatedAt', 'education', 'projects', 'internships'].includes(key)).map(([key, value]) => <div key={key}><p className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p><p className="font-semibold">{Array.isArray(value) ? value.join(', ') : String(value ?? 'Not provided')}</p></div>)}</div></div></div>}
    </main>
  );
}
