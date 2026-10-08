import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function LeaveFaculty() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = () => {
    api.get('/leave').then(res => setLeaves(res.data)).catch(console.error);
  };

  const handleUpdate = async (id: number, status: string) => {
    try {
      await api.post(`/leave/${id}/status`, {
        status, remarks: remarks[id] || ''
      });
      setMessage(`Request ${status.toLowerCase()} successfully`);
      fetchLeaves();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Error updating request');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Leave Requests</h1>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {leaves.length > 0 ? (
          <div className="space-y-4">
            {leaves.map(l => (
              <div key={l.id} className="p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-800">Student ID: {l.student_id}</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${l.status === 'APPROVED' ? 'bg-green-100 text-green-700' : l.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {l.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1"><strong>Dates:</strong> {new Date(l.start_date).toLocaleDateString()} to {new Date(l.end_date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 mb-2"><strong>Reason:</strong> {l.reason}</p>
                  
                  {l.status === 'PENDING' ? (
                    <div className="mt-4">
                      <input 
                        type="text" 
                        placeholder="Add remarks (optional)" 
                        className="w-full p-2 text-sm border rounded mb-2"
                        value={remarks[l.id] || ''}
                        onChange={e => setRemarks(prev => ({...prev, [l.id]: e.target.value}))}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(l.id, 'APPROVED')} className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700">Approve</button>
                        <button onClick={() => handleUpdate(l.id, 'REJECTED')} className="bg-red-600 text-white px-4 py-1.5 rounded text-sm hover:bg-red-700">Reject</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2"><strong>Remarks:</strong> {l.remarks || 'None'}</p>
                  )}
                </div>
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
