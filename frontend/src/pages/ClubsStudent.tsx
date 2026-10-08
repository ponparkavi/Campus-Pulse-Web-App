import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ClubsStudent() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/clubs')
      .then(res => {
        setClubs(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const joinClub = async (id: number) => {
    try {
      await api.post(`/clubs/${id}/join`);
      setMessage('Membership request sent');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Request failed or already a member');
    }
  };

  if (loading) return <p className="text-gray-500">Loading clubs...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Campus Clubs</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clubs.length > 0 ? clubs.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{c.name}</h2>
            <p className="text-sm text-gray-600 flex-1 mb-6">{c.description}</p>
            <button 
              onClick={() => joinClub(c.id)}
              className="mt-auto w-full border border-blue-600 text-blue-600 px-4 py-2 rounded text-sm font-medium hover:bg-blue-50 transition"
            >
              Request to Join
            </button>
          </div>
        )) : (
          <p className="text-gray-500 col-span-full">No clubs found.</p>
        )}
      </div>
    </div>
  );
}
