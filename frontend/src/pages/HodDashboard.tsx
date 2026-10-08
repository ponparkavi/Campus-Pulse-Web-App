import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Building2, Users, Clock, BarChart3, AlertTriangle, CheckSquare, 
  Award, Briefcase, Plus, Check, ArrowUpRight, UserCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HodDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mentorModal, setMentorModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = () => {
    api.get('/dashboard/hod')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedFacultyId) return;
    try {
      await api.post('/hod/assign-mentor', {
        student_id: selectedStudentId,
        faculty_id: selectedFacultyId
      });
      setMentorModal(false);
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Department Head Console...</div>;
  }

  const an = data?.analytics;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-purple-200 bg-white/10 px-3 py-1 rounded-full">
            Department Head Console
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2 tracking-tight">
            {data?.department?.name || 'Department of Computer Science & Engineering'}
          </h1>
          <p className="text-xs text-purple-200 mt-1">
            Department Code: <span className="font-mono font-bold text-white">{data?.department?.code}</span> • Complete Academic & Faculty Governance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/hod/od"
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/20 transition backdrop-blur-sm"
          >
            Review OD Requests ({an?.pending_od_count || 0})
          </Link>
          <Link
            to="/hod/leave"
            className="bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow transition"
          >
            Review Leaves ({an?.pending_leave_count || 0})
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Students</span>
          <span className="text-3xl font-black text-slate-900 font-mono mt-1 block">{an?.total_students || 0}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Faculty: {an?.faculty_count || 0}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Dept Attendance</span>
          <span className="text-3xl font-black text-slate-900 font-mono mt-1 block">{an?.attendance_percentage || 0}%</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Present: {an?.present_count || 0} • OD: {an?.od_count || 0}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pass Rate</span>
          <span className="text-3xl font-black text-emerald-600 font-mono mt-1 block">{an?.pass_percentage || 0}%</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Fail rate: {an?.fail_percentage || 0}%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">At-Risk Students</span>
          <span className="text-3xl font-black text-rose-600 font-mono mt-1 block">{an?.at_risk_count || 0}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Requires intervention</span>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* At-Risk Diagnostics & Weak Students (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h2 className="text-base font-bold text-slate-900">Explainable Risk Engine Diagnostics</h2>
              </div>
              <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
                {an?.at_risk_students?.length || 0} Flagged Cases
              </span>
            </div>

            {an?.at_risk_students?.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                All department students currently meet compliant academic and attendance thresholds.
              </div>
            ) : (
              <div className="space-y-3">
                {an?.at_risk_students?.map((s: any) => (
                  <div key={s.student_id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{s.name}</span>
                        <span className="text-xs font-mono text-slate-400">({s.register_number})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 uppercase">
                          {s.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                        <span>Att: <strong className="text-rose-600">{s.attendance_percentage}%</strong></span>
                        <span>Marks: <strong className="text-slate-800">{s.academic_percentage}%</strong></span>
                      </div>
                      <div className="text-xs text-rose-700 mt-1.5 italic">
                        {s.reasons?.join('; ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedStudentId(s.student_id);
                          setMentorModal(true);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-sm"
                      >
                        Assign Mentor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Faculty Members */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Department Faculty & Mentors</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data?.faculty_members?.map((fac: any) => (
                <div key={fac.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{fac.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Tel: {fac.phone || 'Internal'}</p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                    Faculty
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Department Financial & Academic Overview */}
        <div className="space-y-6">
          {/* Fee Metrics */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Department Fee Audit</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Billed Fees</span>
                <span className="font-mono font-bold text-slate-900">₹{an?.fee_stats?.total || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Collected Amount</span>
                <span className="font-mono font-bold text-emerald-600">₹{an?.fee_stats?.paid || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Outstanding Balance</span>
                <span className="font-mono font-bold text-rose-600">₹{an?.fee_stats?.outstanding || 0}</span>
              </div>
            </div>
          </div>

          {/* Department Subjects */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Subjects</h3>
            <div className="space-y-2">
              {data?.subjects?.map((sub: any) => (
                <div key={sub.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{sub.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{sub.code} • Sem {sub.semester}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mentor Assignment Modal */}
      {mentorModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">Assign Faculty Mentor</h3>
            <form onSubmit={handleAssignMentor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Faculty Mentor</label>
                <select
                  required
                  onChange={e => setSelectedFacultyId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Choose Faculty Member --</option>
                  {data?.faculty_members?.map((fac: any) => (
                    <option key={fac.id} value={fac.id}>{fac.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setMentorModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Assign Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
