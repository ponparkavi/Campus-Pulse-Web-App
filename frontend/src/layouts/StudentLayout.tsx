import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const studentLinks = [
  { name: 'Dashboard', path: '/student' },
  { name: 'Profile & Portfolio', path: '/student/profile' },
  { name: 'Attendance & Analytics', path: '/student/attendance' },
  { name: 'Marks & Performance', path: '/student/marks' },
  { name: 'On Duty (OD)', path: '/student/od' },
  { name: 'Leave Requests', path: '/student/leave' },
  { name: 'Placement Cell', path: '/student/placement' },
  { name: 'Academic Calendar', path: '/student/calendar' },
  { name: 'Assignments', path: '/student/assignments' },
  { name: 'Study Materials', path: '/student/materials' },
  { name: 'Timetable', path: '/student/timetable' },
  { name: 'Academic Support', path: '/student/evening-classes' },
  { name: 'Events', path: '/student/events' },
  { name: 'Clubs', path: '/student/clubs' },
  { name: 'Opportunities', path: '/student/opportunities' },
  { name: 'Fees & Dues', path: '/student/fees' },
  { name: 'Student Requests', path: '/student/requests' },
  { name: 'Queries & Help', path: '/student/queries' },
];

export default function StudentLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={studentLinks} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
