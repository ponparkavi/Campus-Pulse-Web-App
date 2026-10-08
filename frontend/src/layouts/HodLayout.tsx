import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const hodLinks = [
  { name: 'HOD Dashboard', path: '/hod' },
  { name: 'Attendance Analytics', path: '/hod/attendance' },
  { name: 'Marks & Pass/Fail Rate', path: '/hod/performance' },
  { name: 'At-Risk Diagnostic Engine', path: '/hod/risk' },
  { name: 'Approve Leaves', path: '/hod/leave' },
  { name: 'Approve OD Requests', path: '/hod/od' },
  { name: 'Department Students', path: '/hod/students' },
  { name: 'Department Faculty', path: '/hod/faculty' },
  { name: 'Mentor Assignment', path: '/hod/mentors' },
  { name: 'Academic Calendar', path: '/hod/calendar' },
  { name: 'Department Reports', path: '/hod/reports' },
  { name: 'Broadcast Notice', path: '/hod/communication' },
];

export default function HodLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={hodLinks} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
