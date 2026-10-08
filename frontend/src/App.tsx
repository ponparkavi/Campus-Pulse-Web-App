import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import FacultyLayout from './layouts/FacultyLayout';
import MentorLayout from './layouts/MentorLayout';
import HodLayout from './layouts/HodLayout';
import PrincipalLayout from './layouts/PrincipalLayout';
import ParentLayout from './layouts/ParentLayout';
import AdminLayout from './layouts/AdminLayout';

// Shared / Existing Pages
import Login_Page from './pages/Login';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import AttendanceStudent from './pages/AttendanceStudent';
import MarksStudent from './pages/MarksStudent';
import ODStudent from './pages/ODStudent';
import LeaveStudent from './pages/LeaveStudent';
import PlacementStudent from './pages/PlacementStudent';
import CalendarPage from './pages/CalendarPage';
import AssignmentsStudent from './pages/AssignmentsStudent';
import MaterialsStudent from './pages/MaterialsStudent';
import TimetableStudent from './pages/TimetableStudent';
import EveningClassesStudent from './pages/EveningClassesStudent';
import EventsStudent from './pages/EventsStudent';
import ClubsStudent from './pages/ClubsStudent';
import OpportunitiesStudent from './pages/OpportunitiesStudent';
import FeesStudent from './pages/FeesStudent';
import RequestsStudent from './pages/RequestsStudent';
import QueriesStudent from './pages/QueriesStudent';

// Faculty Pages
import FacultyDashboard from './pages/FacultyDashboard';
import AttendanceFaculty from './pages/AttendanceFaculty';
import MarksFaculty from './pages/MarksFaculty';
import ODFaculty from './pages/ODFaculty';
import LeaveFaculty from './pages/LeaveFaculty';
import AssignmentsFaculty from './pages/AssignmentsFaculty';
import MaterialsFaculty from './pages/MaterialsFaculty';
import EveningClassesFaculty from './pages/EveningClassesFaculty';
import MentorFaculty from './pages/MentorFaculty';
import VerificationsFaculty from './pages/VerificationsFaculty';
import QueriesFaculty from './pages/QueriesFaculty';

// Mentor Pages
import MentorDashboard from './pages/MentorDashboard';

// HOD Pages
import HodDashboard from './pages/HodDashboard';

// Principal Pages
import PrincipalDashboard from './pages/PrincipalDashboard';

// Parent Pages
import ParentDashboard from './pages/ParentDashboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminDepartments from './pages/AdminDepartments';
import AdminSubjects from './pages/AdminSubjects';
import AdminClasses from './pages/AdminClasses';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminPlacements from './pages/AdminPlacements';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminSettings from './pages/AdminSettings';
import AdminReports from './pages/AdminReports';
import EmailCommunicationPage from './pages/EmailCommunicationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* STUDENT ECOSYSTEM */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="attendance" element={<AttendanceStudent />} />
          <Route path="marks" element={<MarksStudent />} />
          <Route path="od" element={<ODStudent />} />
          <Route path="leave" element={<LeaveStudent />} />
          <Route path="placement" element={<PlacementStudent />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="assignments" element={<AssignmentsStudent />} />
          <Route path="materials" element={<MaterialsStudent />} />
          <Route path="timetable" element={<TimetableStudent />} />
          <Route path="evening-classes" element={<EveningClassesStudent />} />
          <Route path="events" element={<EventsStudent />} />
          <Route path="clubs" element={<ClubsStudent />} />
          <Route path="opportunities" element={<OpportunitiesStudent />} />
          <Route path="fees" element={<FeesStudent />} />
          <Route path="requests" element={<RequestsStudent />} />
          <Route path="queries" element={<QueriesStudent />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        
        {/* FACULTY PORTAL */}
        <Route path="/faculty" element={
          <ProtectedRoute allowedRoles={['FACULTY', 'MENTOR', 'HOD', 'PRINCIPAL']}>
            <FacultyLayout />
          </ProtectedRoute>
        }>
          <Route index element={<FacultyDashboard />} />
          <Route path="attendance" element={<AttendanceFaculty />} />
          <Route path="marks" element={<MarksFaculty />} />
          <Route path="od" element={<ODFaculty />} />
          <Route path="leave" element={<LeaveFaculty />} />
          <Route path="assignments" element={<AssignmentsFaculty />} />
          <Route path="materials" element={<MaterialsFaculty />} />
          <Route path="evening-classes" element={<EveningClassesFaculty />} />
          <Route path="mentees" element={<MentorFaculty />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="verifications" element={<VerificationsFaculty />} />
          <Route path="queries" element={<QueriesFaculty />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* MENTOR PORTAL */}
        <Route path="/mentor" element={
          <ProtectedRoute allowedRoles={['MENTOR', 'FACULTY', 'HOD']}>
            <MentorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<MentorDashboard />} />
          <Route path="students" element={<MentorFaculty />} />
          <Route path="risk" element={<MentorFaculty />} />
          <Route path="counselling" element={<MentorFaculty />} />
          <Route path="evening-classes" element={<EveningClassesFaculty />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="communication" element={<EmailCommunicationPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* HOD PORTAL */}
        <Route path="/hod" element={
          <ProtectedRoute allowedRoles={['HOD', 'ADMIN']}>
            <HodLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HodDashboard />} />
          <Route path="attendance" element={<AttendanceFaculty />} />
          <Route path="performance" element={<MarksFaculty />} />
          <Route path="risk" element={<HodDashboard />} />
          <Route path="leave" element={<LeaveFaculty />} />
          <Route path="od" element={<ODFaculty />} />
          <Route path="students" element={<HodDashboard />} />
          <Route path="faculty" element={<HodDashboard />} />
          <Route path="mentors" element={<HodDashboard />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="communication" element={<EmailCommunicationPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* PRINCIPAL PORTAL */}
        <Route path="/principal" element={
          <ProtectedRoute allowedRoles={['PRINCIPAL', 'ADMIN']}>
            <PrincipalLayout />
          </ProtectedRoute>
        }>
          <Route index element={<PrincipalDashboard />} />
          <Route path="analytics" element={<PrincipalDashboard />} />
          <Route path="departments" element={<PrincipalDashboard />} />
          <Route path="risk" element={<PrincipalDashboard />} />
          <Route path="placements" element={<AdminPlacements />} />
          <Route path="fees" element={<PrincipalDashboard />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="communication" element={<EmailCommunicationPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* PARENT PORTAL */}
        <Route path="/parent" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <ParentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ParentDashboard />} />
          <Route path="attendance" element={<ParentDashboard />} />
          <Route path="marks" element={<ParentDashboard />} />
          <Route path="fees" element={<ParentDashboard />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="support" element={<ParentDashboard />} />
          <Route path="mentor" element={<ParentDashboard />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        
        {/* ADMIN PORTAL */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="subjects" element={<AdminSubjects />} />
          <Route path="classes" element={<AdminClasses />} />
          <Route path="placements" element={<AdminPlacements />} />
          <Route path="requests" element={<RequestsStudent />} />
          <Route path="documents" element={<MaterialsFaculty />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="audit" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="communication" element={<EmailCommunicationPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
