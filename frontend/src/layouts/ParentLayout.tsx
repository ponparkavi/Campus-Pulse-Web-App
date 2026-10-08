import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const parentLinks = [
  { name: 'Student Overview', path: '/parent' },
  { name: 'Attendance Record', path: '/parent/attendance' },
  { name: 'Marks & Academic Trend', path: '/parent/marks' },
  { name: 'Fees & Payment Status', path: '/parent/fees' },
  { name: 'Academic Calendar', path: '/parent/calendar' },
  { name: 'Support & Alerts', path: '/parent/support' },
  { name: 'Mentor Consultation', path: '/parent/mentor' },
];

export default function ParentLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={parentLinks} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
