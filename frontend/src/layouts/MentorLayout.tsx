import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const mentorLinks = [
  { name: 'Mentor Dashboard', path: '/mentor' },
  { name: 'My Assigned Mentees', path: '/mentor/students' },
  { name: 'At-Risk Student Diagnostic', path: '/mentor/risk' },
  { name: 'Counselling Records', path: '/mentor/counselling' },
  { name: 'Academic Support Classes', path: '/mentor/evening-classes' },
  { name: 'Academic Calendar', path: '/mentor/calendar' },
  { name: 'Email & Notices', path: '/mentor/communication' },
];

export default function MentorLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={mentorLinks} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
