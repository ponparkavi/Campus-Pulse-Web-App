import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      api.get(`/search?q=${encodeURIComponent(query)}`)
        .then(res => {
          setResults(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [query]);

  if (!query) return <div className="text-gray-500">Enter a search term above to find resources.</div>;

  const hasResults = results && (
    results.announcements.length > 0 ||
    results.events.length > 0 ||
    results.clubs.length > 0 ||
    results.opportunities.length > 0 ||
    results.materials.length > 0
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Search Results</h1>
      <p className="text-gray-600 mb-8">Showing results for: <span className="font-semibold text-blue-600">"{query}"</span></p>

      {loading && (
        <div className="flex items-center text-gray-500">
          <Search className="w-5 h-5 mr-2 animate-spin" /> Searching CampusPulse...
        </div>
      )}

      {!loading && !hasResults && (
        <div className="bg-gray-50 border border-gray-200 rounded p-8 text-center text-gray-500">
          No results found matching your query.
        </div>
      )}

      {!loading && hasResults && (
        <div className="space-y-8">
          {Object.entries(results).map(([category, items]: [string, any]) => {
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <h2 className="text-lg font-bold text-gray-800 capitalize border-b pb-2 mb-4">{category}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((item: any) => (
                    <div key={`${category}-${item.id}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800">{item.title}</h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{item.type}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
