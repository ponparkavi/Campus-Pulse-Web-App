import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, GraduationCap, Building, Bell } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard/admin').then(res => setData(res.data)).catch(console.error);
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      {data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Total Students" 
            value={data.total_students}
            icon={<GraduationCap className="text-blue-500" />}
            color="bg-blue-50"
          />
          <DashboardCard 
            title="Total Faculty" 
            value={data.total_faculty}
            icon={<Users className="text-green-500" />}
            color="bg-green-50"
          />
          <DashboardCard 
            title="Departments" 
            value={data.total_departments}
            icon={<Building className="text-purple-500" />}
            color="bg-purple-50"
          />
          <DashboardCard 
            title="Announcements" 
            value={data.announcements}
            icon={<Bell className="text-yellow-500" />}
            color="bg-yellow-50"
          />
        </div>
      ) : (
        <p className="text-gray-500">Loading dashboard data...</p>
      )}
    </>
  );
}

function DashboardCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:-translate-y-1">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  );
}
