import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Clock, AlertTriangle, CheckCircle, Calculator, Calendar, BookOpen } from 'lucide-react';

export default function AttendanceStudent() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState<string>('ALL');

  useEffect(() => {
    Promise.all([
      api.get('/students/me/profile'),
      api.get('/attendance/my')
    ]).then(([profileRes, histRes]) => {
      setAnalytics(profileRes.data.attendance_summary);
      setHistory(histRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
        Loading Attendance Intelligence...
      </div>
    );
  }

  const attPct = analytics?.attendance_percentage ?? 0;
  const isBelow = attPct < 75.0;

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'OD': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LEAVE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ABSENT': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredHistory = filterSubject === 'ALL'
    ? history
    : history.filter(h => String(h.subject_id) === filterSubject);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Intelligence</h1>
          <p className="text-xs text-slate-500">Real-time attendance tracking with safe margin forecasting.</p>
        </div>
        <div className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          Rule: (Present + OD) / Total × 100
        </div>
      </div>

      {/* Main KPI & Safe Margin Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Overview (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall Academic Standing</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className={`text-4xl font-extrabold ${isBelow ? 'text-rose-600' : 'text-slate-900'}`}>
                  {attPct}%
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isBelow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {isBelow ? 'Below Minimum Requirement' : 'Good Attendance Standing'}
                </span>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-xs text-slate-400 font-medium">Eligible Working Classes</span>
              <div className="text-xl font-extrabold text-slate-800 font-mono mt-0.5">{analytics?.total_classes || 0}</div>
            </div>
          </div>

          {/* Counts Grid */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 block">Present</span>
              <span className="text-xl font-extrabold text-emerald-700 font-mono mt-1 block">{analytics?.present_count || 0}</span>
            </div>
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
              <span className="text-[11px] font-bold text-rose-800 block">Absent</span>
              <span className="text-xl font-extrabold text-rose-700 font-mono mt-1 block">{analytics?.absent_count || 0}</span>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <span className="text-[11px] font-bold text-blue-800 block">On Duty (OD)</span>
              <span className="text-xl font-extrabold text-blue-700 font-mono mt-1 block">{analytics?.od_count || 0}</span>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
              <span className="text-[11px] font-bold text-amber-800 block">Approved Leave</span>
              <span className="text-xl font-extrabold text-amber-700 font-mono mt-1 block">{analytics?.leave_count || 0}</span>
            </div>
          </div>

          {isBelow && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-center gap-2.5 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Warning: Attendance below 75% will disqualify you from sitting in semester theory examinations.</span>
            </div>
          )}
        </div>

        {/* Safe Margin / "How many classes can I miss?" Calculator */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Safe Margin Predictor</h2>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Can I miss any classes?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on the configurable 75% institutional threshold rule.
            </p>

            <div className="mt-5 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              {!isBelow ? (
                <div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    {analytics?.classes_can_miss || 0}
                  </div>
                  <p className="text-xs text-slate-200 font-medium mt-1">
                    classes can be missed without dropping below 75%.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-black text-rose-400 font-mono">
                    {analytics?.classes_needed || 0}
                  </div>
                  <p className="text-xs text-slate-200 font-medium mt-1">
                    consecutive classes required to restore attendance to 75%.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-white/10 text-[11px] text-slate-400 text-center">
            Automatic calculation updated with every session.
          </div>
        </div>
      </div>

      {/* Subject-wise Attendance Breakdown Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Subject-Wise Attendance Breakdown</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3 text-center">Total Sessions</th>
                <th className="py-3 px-3 text-center">Present</th>
                <th className="py-3 px-3 text-center">Absent</th>
                <th className="py-3 px-3 text-center">OD</th>
                <th className="py-3 px-3 text-center">Leave</th>
                <th className="py-3 px-3 text-right">Attendance %</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics?.subject_breakdown?.map((subj: any) => {
                const isSubLow = subj.percentage < 75.0;
                return (
                  <tr key={subj.subject_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{subj.subject_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{subj.subject_code}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium">{subj.total}</td>
                    <td className="py-3 px-3 text-center text-emerald-600 font-mono font-medium">{subj.present}</td>
                    <td className="py-3 px-3 text-center text-rose-600 font-mono font-medium">{subj.absent}</td>
                    <td className="py-3 px-3 text-center text-blue-600 font-mono font-medium">{subj.od}</td>
                    <td className="py-3 px-3 text-center text-amber-600 font-mono font-medium">{subj.leave}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`font-mono font-bold text-sm ${isSubLow ? 'text-rose-600' : 'text-slate-900'}`}>
                        {subj.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSubLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isSubLow ? 'Low Attendance' : 'Compliant'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance History Log */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Attendance Session History</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Subject:</span>
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg p-1.5 outline-none bg-white font-medium"
            >
              <option value="ALL">All Subjects</option>
              {analytics?.subject_breakdown?.map((s: any) => (
                <option key={s.subject_id} value={String(s.subject_id)}>{s.subject_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Session Date</th>
                <th className="py-3 px-3">Subject ID</th>
                <th className="py-3 px-3 text-center">Recorded Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((rec: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono text-slate-800 font-medium">{rec.date}</td>
                  <td className="py-3 px-3 text-slate-600">Subject #{rec.subject_id}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(rec.status)}`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
