import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Clock, BarChart3, CheckSquare, Bell, Calendar, AlertTriangle, 
  Briefcase, Award, ArrowUpRight, CheckCircle2, ShieldAlert, BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [attData, setAttData] = useState<any>(null);
  const [perfData, setPerfData] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [placements, setPlacements] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [eveningClasses, setEveningClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/students/me/profile'),
      api.get('/attendance/my'),
      api.get('/performance/analytics'),
      api.get('/risk/my'),
      api.get('/placement/my-applications'),
      api.get('/announcements'),
      api.get('/evening-classes/my')
    ]).then(([pRes, attRes, perfRes, rRes, plRes, annRes, ecRes]) => {
      setProfile(pRes.data);
      setAttData(pRes.data.attendance_summary);
      setPerfData(pRes.data.performance_summary);
      setRiskData(rRes.data);
      setPlacements(plRes.data);
      setAnnouncements(annRes.data.slice(0, 4));
      setEveningClasses(ecRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
        Loading Integrated Academic Portal...
      </div>
    );
  }

  const attPct = attData?.attendance_percentage ?? 0;
  const isAttLow = attPct < 75;
  const isRiskAlert = riskData?.category === 'AT_RISK' || riskData?.category === 'NEEDS_ATTENTION';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Profile Greeting Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500/30 text-blue-200 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-400/30">
                {profile?.department_code || 'CSE'} • Year {profile?.year || 3} Sem {profile?.semester || 6}
              </span>
              <span className="bg-emerald-500/30 text-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-mono">
                Reg: {profile?.register_number}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome, {profile?.name || 'Student'}!
            </h1>
            <p className="text-sm text-blue-100/90 mt-1">
              Your comprehensive student life dashboard and academic progress overview.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link 
              to="/student/profile" 
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition flex items-center gap-1.5 backdrop-blur-sm"
            >
              <span>Digital Identity</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              to="/student/od" 
              className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <span>Apply On-Duty</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Risk Alert Banner if Triggered */}
      {isRiskAlert && (
        <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
          riskData.category === 'AT_RISK' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${riskData.category === 'AT_RISK' ? 'text-rose-600' : 'text-amber-600'}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                Academic Support Advisory: {riskData.category.replace('_', ' ')}
              </span>
            </div>
            <ul className="text-xs mt-1.5 list-disc list-inside space-y-0.5 text-slate-700">
              {riskData.reasons?.map((reason: string, idx: number) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
            {riskData.recommended_actions?.length > 0 && (
              <div className="text-xs font-medium mt-2 text-blue-700">
                Recommended: {riskData.recommended_actions.join(' • ')}
              </div>
            )}
          </div>
          <Link 
            to="/student/evening-classes" 
            className="text-xs font-semibold underline shrink-0 mt-1 hover:text-blue-700"
          >
            Support Details →
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Attendance Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attendance</span>
            <div className={`p-2 rounded-xl ${isAttLow ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold ${isAttLow ? 'text-rose-600' : 'text-slate-900'}`}>
                {attPct}%
              </span>
              <span className="text-xs text-slate-500">
                (Min 75% req)
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2 font-mono">
              <span>P: {attData?.present_count || 0}</span>
              <span>A: {attData?.absent_count || 0}</span>
              <span>OD: {attData?.od_count || 0}</span>
              <span>L: {attData?.leave_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Performance</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {perfData?.overall_percentage ?? 0}%
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                perfData?.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {perfData?.status || 'PASS'}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
              Passed: {perfData?.pass_count || 0} • Tests Failed: {perfData?.fail_count || 0}
            </p>
          </div>
        </div>

        {/* Placements Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Placement Status</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">
              {placements.length > 0 ? placements[0].status : 'Eligible'}
            </span>
            <p className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
              {placements.length > 0 
                ? `${placements[0].company_name} (${placements[0].ctc_package})` 
                : '3 Drives Currently Open'}
            </p>
          </div>
        </div>

        {/* Mentor & Advisor Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned Mentor</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 block truncate">
              {profile?.mentor?.name || 'Faculty Mentor'}
            </span>
            <p className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
              Tel: {profile?.mentor?.phone || 'Campus Extension'}
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Attendance Calculator & Subject Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Missable Class Calculator Tool */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Attendance Safe Margin Calculator</h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-mono">
                Formula: (Present + OD) / Classes ≥ 75%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Margin Status</p>
                {attPct >= 75 ? (
                  <p className="text-sm font-medium text-emerald-800 mt-0.5">
                    You can safely miss up to <strong className="text-emerald-700 text-lg font-bold">{attData?.classes_can_miss || 0}</strong> more class(es) while maintaining 75%.
                  </p>
                ) : (
                  <p className="text-sm font-medium text-rose-800 mt-0.5">
                    Attendance Warning! You need to attend <strong className="text-rose-700 text-lg font-bold">{attData?.classes_needed || 0}</strong> consecutive class(es) to reach 75%.
                  </p>
                )}
              </div>
              <Link 
                to="/student/attendance" 
                className="text-xs font-semibold bg-white border border-slate-200 px-3.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition whitespace-nowrap shadow-sm"
              >
                Subject Details →
              </Link>
            </div>
          </div>

          {/* Evening Academic Support Schedule if Enrolled */}
          {eveningClasses.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Scheduled Evening Support Classes</span>
              </h2>
              <div className="space-y-2.5">
                {eveningClasses.map((ec: any) => (
                  <div key={ec.id} className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{ec.subject_name}</div>
                      <div className="text-xs text-slate-500 font-medium">Instructor: {ec.faculty_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-indigo-700 font-mono">{ec.date}</div>
                      <div className="text-[11px] text-slate-500">{ec.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Academic Hub Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { title: 'Academic Calendar', path: '/student/calendar', desc: 'Exams & Schedules' },
              { title: 'Placement Drives', path: '/student/placement', desc: 'Google, MSFT, Zoho' },
              { title: 'Study Materials', path: '/student/materials', desc: 'Notes & Syllabus' },
              { title: 'Student Requests', path: '/student/requests', desc: 'Bonafide, No-Due' },
              { title: 'Fees & Dues', path: '/student/fees', desc: 'Receipts & Status' },
              { title: 'Queries & Help', path: '/student/queries', desc: 'Ask Faculty' },
            ].map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="p-3.5 rounded-xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-sm transition group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">{item.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Campus Announcements & Events */}
        <div className="space-y-6">
          {/* Announcements Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Notice Board</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">{announcements.length} updates</span>
            </div>

            <div className="space-y-3.5">
              {announcements.map((ann: any) => (
                <div key={ann.id} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition border border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{ann.title}</div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">{ann.content}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl text-white shadow-sm space-y-3">
            <h3 className="text-sm font-bold">Quick Services</h3>
            <p className="text-xs text-slate-400">Directly submit requests or access student portals.</p>
            <div className="space-y-2 pt-1">
              <Link 
                to="/student/od" 
                className="w-full block text-center text-xs font-semibold py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition shadow"
              >
                + New OD Application
              </Link>
              <Link 
                to="/student/leave" 
                className="w-full block text-center text-xs font-semibold py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
              >
                Apply Medical / Casual Leave
              </Link>
              <Link 
                to="/student/requests" 
                className="w-full block text-center text-xs font-semibold py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
              >
                Apply Bonafide Certificate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
