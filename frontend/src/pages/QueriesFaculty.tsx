import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function QueriesFaculty() {
  const [queries, setQueries] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = () => {
    api.get('/queries').then(res => setQueries(res.data)).catch(console.error);
  };

  const handleReply = async (id: number, status: string) => {
    try {
      await api.patch(`/queries/${id}`, {
        answer: answers[id] || '',
        status
      });
      setMessage('Query updated successfully');
      fetchQueries();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update query');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Queries</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {queries.length > 0 ? queries.map(q => (
          <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs text-gray-500 font-medium">Student ID: {q.student_id}</span>
                <p className="font-medium text-gray-800 mt-1">{q.question}</p>
              </div>
              <span className={`ml-4 px-2 py-1 text-xs font-semibold rounded-full ${q.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {q.status}
              </span>
            </div>
            
            {q.status === 'OPEN' ? (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <textarea 
                  placeholder="Type your response..."
                  className="w-full p-2 text-sm border border-gray-300 rounded mb-2"
                  rows={2}
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                ></textarea>
                <div className="flex gap-2">
                  <button onClick={() => handleReply(q.id, 'RESOLVED')} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">Submit & Resolve</button>
                  <button onClick={() => handleReply(q.id, 'OPEN')} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">Save Draft</button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded mt-3 text-sm text-gray-700">
                <strong>Your Response:</strong> {q.answer}
              </div>
            )}
          </div>
        )) : (
          <p className="text-gray-500">No queries found.</p>
        )}
      </div>
    </div>
  );
}
