import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function MaterialsStudent() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/materials')
      .then(res => {
        setMaterials(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <p className="text-gray-500">Loading materials...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Study Materials</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {materials.length > 0 ? materials.map(m => (
          <div key={m.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{m.title}</h2>
            <p className="text-sm text-gray-600 flex-1 mb-4">{m.description}</p>
            <a 
              href={m.file_url} 
              target="_blank" 
              rel="noreferrer"
              className="mt-auto bg-blue-50 text-blue-600 px-4 py-2 rounded text-center text-sm font-medium hover:bg-blue-100 transition"
            >
              Access Material
            </a>
          </div>
        )) : (
          <p className="text-gray-500">No study materials found.</p>
        )}
      </div>
    </div>
  );
}
