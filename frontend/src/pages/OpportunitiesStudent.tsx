import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ExternalLink, Calendar } from 'lucide-react';

export default function OpportunitiesStudent() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get('/opportunities')
      .then(res => {
        setOpportunities(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <p className="text-gray-500">Loading opportunities...</p>;

  const filtered = filter === 'All' ? opportunities : opportunities.filter(o => o.category === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Career & Opportunities</h1>
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['All', 'Internship', 'Placement', 'Scholarship', 'Competition', 'Certification'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.length > 0 ? filtered.map(o => {
          const isExpired = o.deadline && new Date(o.deadline) < new Date();
          return (
            <div key={o.id} className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full ${isExpired ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{o.title}</h2>
                  <p className="text-sm font-medium text-blue-600">{o.organization}</p>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{o.category}</span>
              </div>
              <p className="text-sm text-gray-600 flex-1 my-4">{o.description}</p>
              
              {o.deadline && (
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4 mr-2" /> Deadline: {new Date(o.deadline).toLocaleDateString()}
                  {isExpired && <span className="text-red-500 ml-2 font-medium">(Expired)</span>}
                </div>
              )}
              
              {o.link && (
                <a 
                  href={o.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-auto flex items-center justify-center w-full border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 transition"
                >
                  View Details <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              )}
            </div>
          );
        }) : (
          <p className="text-gray-500 col-span-full">No opportunities found for this category.</p>
        )}
      </div>
    </div>
  );
}
