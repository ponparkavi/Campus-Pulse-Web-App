import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, BookOpen } from 'lucide-react';

export default function FacultyDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard/faculty').then(res => setData(res.data)).catch(console.error);
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Faculty Dashboard</h1>
      
      {data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">My Subjects</p>
              <p className="text-2xl font-bold text-gray-800">{data.subjects?.length || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <BookOpen className="text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-800">{data.total_students || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <Users className="text-green-500" />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Loading dashboard data...</p>
      )}
    </>
  );
}
