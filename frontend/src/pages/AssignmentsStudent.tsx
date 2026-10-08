import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AssignmentsStudent() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = () => {
    api.get('/assignments')
      .then(res => {
        setAssignments(res.data);
        setLoading(false);
      })
      .catch(console.error);
  };

  const handleSubmit = async (id: number) => {
    try {
      await api.post(`/assignments/${id}/submit`, { content });
      setMessage('Assignment submitted successfully');
      setContent('');
      setSelectedId(null);
      fetchAssignments();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to submit');
    }
  };

  if (loading) return <p className="text-gray-500">Loading assignments...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Assignments</h1>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          {message}
        </div>
      )}

      <div className="grid gap-6">
        {assignments.length > 0 ? assignments.map(a => (
          <div key={a.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{a.title}</h2>
                <p className="text-sm text-gray-500">Deadline: {new Date(a.deadline).toLocaleDateString()}</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                ID: {a.id}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{a.description}</p>
            
            {/* The student submission section */}
            {selectedId === a.id ? (
              <div className="mt-4 border-t pt-4">
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded mb-2 text-sm"
                  rows={4}
                  placeholder="Enter your submission here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                ></textarea>
                <div className="flex gap-2">
                  <button onClick={() => handleSubmit(a.id)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                    Submit
                  </button>
                  <button onClick={() => setSelectedId(null)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-300">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setSelectedId(a.id)}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Submit Assignment
              </button>
            )}
          </div>
        )) : (
          <p className="text-gray-500">No assignments found.</p>
        )}
      </div>
    </div>
  );
}
