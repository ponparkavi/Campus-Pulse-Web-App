import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const principalLinks = [
  { name: 'Executive Dashboard', path: '/principal' },
  { name: 'College Analytics', path: '/principal/analytics' },
  { name: 'Department Comparison', path: '/principal/departments' },
  { name: 'Institutional Risk View', path: '/principal/risk' },
  { name: 'Placement Analytics', path: '/principal/placements' },
  { name: 'Fee Collection Audit', path: '/principal/fees' },
  { name: 'Master Academic Calendar', path: '/principal/calendar' },
  { name: 'Institution Reports', path: '/principal/reports' },
  { name: 'Official Broadcast', path: '/principal/communication' },
];

export default function PrincipalLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={principalLinks} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
