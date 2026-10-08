import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const adminLinks = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Users Management', path: '/admin/users' },
  { name: 'Departments', path: '/admin/departments' },
  { name: 'Subjects', path: '/admin/subjects' },
  { name: 'Classes', path: '/admin/classes' },
  { name: 'Placement Cell', path: '/admin/placements' },
  { name: 'Document Repository', path: '/admin/documents' },
  { name: 'Student Requests', path: '/admin/requests' },
  { name: 'Announcements', path: '/admin/announcements' },
  { name: 'Institution Reports', path: '/admin/reports' },
  { name: 'Audit Logs', path: '/admin/audit' },
  { name: 'System Settings', path: '/admin/settings' },
  { name: 'Email Communication', path: '/admin/communication' },
];

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={adminLinks} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
