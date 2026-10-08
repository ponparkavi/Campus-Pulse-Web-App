import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const facultyLinks = [
  { name: 'Dashboard', path: '/faculty' },
  { name: 'Mark Attendance', path: '/faculty/attendance' },
  { name: 'Enter Marks', path: '/faculty/marks' },
  { name: 'Review OD Requests', path: '/faculty/od' },
  { name: 'Review Leaves', path: '/faculty/leave' },
  { name: 'Assignments', path: '/faculty/assignments' },
  { name: 'Study Materials', path: '/faculty/materials' },
  { name: 'Academic Support Class', path: '/faculty/evening-classes' },
  { name: 'Mentorship & Counselling', path: '/faculty/mentees' },
  { name: 'Academic Calendar', path: '/faculty/calendar' },
  { name: 'Portfolio Verifications', path: '/faculty/verifications' },
  { name: 'Student Queries', path: '/faculty/queries' },
];

export default function FacultyLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={facultyLinks} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
