import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function LeaveStudent() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = () => {
    api.get('/leave').then(res => setLeaves(res.data)).catch(console.error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leave', {
        reason, start_date: startDate, end_date: endDate
      });
      setMessage('Leave request submitted successfully');
      setReason(''); setStartDate(''); setEndDate('');
      fetchLeaves();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Error submitting request');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Leave Requests</h1>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Apply for Leave</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" required className="w-full p-2 border border-gray-300 rounded" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" required className="w-full p-2 border border-gray-300 rounded" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea required className="w-full p-2 border border-gray-300 rounded" rows={3} value={reason} onChange={e => setReason(e.target.value)}></textarea>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Submit Request</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Leave History</h2>
        {leaves.length > 0 ? (
          <div className="space-y-4">
            {leaves.map(l => (
              <div key={l.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-gray-800">{new Date(l.start_date).toLocaleDateString()} to {new Date(l.end_date).toLocaleDateString()}</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${l.status === 'APPROVED' ? 'bg-green-100 text-green-700' : l.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {l.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2"><strong>Reason:</strong> {l.reason}</p>
                {l.remarks && <p className="text-sm text-gray-500"><strong>Remarks:</strong> {l.remarks}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No leave requests found.</p>
        )}
      </div>
    </div>
  );
}
