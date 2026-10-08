import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, Clock } from 'lucide-react';

export default function EveningClassesStudent() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/evening-classes/my')
      .then(res => {
        setClasses(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <p className="text-gray-500">Loading support classes...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Academic Support Classes</h1>
      <p className="text-gray-600 mb-8">
        These are additional support classes assigned to you by faculty to help improve your academic performance.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.length > 0 ? classes.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 border-t-4 border-t-blue-500">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{c.subject_name}</h2>
            <p className="text-sm text-gray-600 mb-4">Faculty: {c.faculty_name}</p>
            
            <div className="space-y-2">
              <div className="flex items-center text-gray-700">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm">{new Date(c.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm">{c.time}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full bg-gray-50 border border-gray-200 rounded p-6 text-center">
            <p className="text-gray-500 font-medium">You have no evening classes assigned right now. Keep up the good work!</p>
          </div>
        )}
      </div>
    </div>
  );
}
