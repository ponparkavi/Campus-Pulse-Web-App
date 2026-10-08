import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function QueriesStudent() {
  const [queries, setQueries] = useState<any[]>([]);
  const [question, setQuestion] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = () => {
    api.get('/queries')
      .then(res => {
        setQueries(res.data);
        setLoading(false);
      })
      .catch(console.error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/queries', { question });
      setMessage('Query submitted successfully');
      setQuestion('');
      fetchQueries();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to submit query');
    }
  };

  if (loading) return <p className="text-gray-500">Loading queries...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Queries / Doubts</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ask a Question</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea 
            required 
            placeholder="Type your academic or administrative query here..."
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            rows={4} 
            value={question} 
            onChange={e => setQuestion(e.target.value)}
          ></textarea>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Submit Query
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Your Queries</h2>
        {queries.length > 0 ? queries.map(q => (
          <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <p className="font-medium text-gray-800 flex-1">{q.question}</p>
              <span className={`ml-4 px-2 py-1 text-xs font-semibold rounded-full ${q.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {q.status}
              </span>
            </div>
            {q.answer ? (
              <div className="bg-blue-50 p-3 rounded border border-blue-100 mt-3">
                <p className="text-sm text-blue-800 font-semibold mb-1">Faculty Response:</p>
                <p className="text-sm text-gray-700">{q.answer}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic mt-2">Waiting for response...</p>
            )}
          </div>
        )) : (
          <p className="text-gray-500">You haven't asked any queries yet.</p>
        )}
      </div>
    </div>
  );
}
