import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, Users, AlertTriangle, CheckCircle2, Clock, Calendar, Mail, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MentorDashboard() {
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mentor/mentees')
      .then(res => {
        setMentees(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Mentor Portal...</div>;
  }

  const atRiskCount = mentees.filter(m => m.risk_category === 'AT_RISK').length;
  const needsAttnCount = mentees.filter(m => m.risk_category === 'NEEDS_ATTENTION').length;
  const avgAtt = mentees.length > 0 
    ? Math.round(mentees.reduce((acc, m) => acc + m.attendance_percentage, 0) / mentees.length) 
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Mentor Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-200 bg-white/10 px-3 py-1 rounded-full">
            Faculty Mentorship Program
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2 tracking-tight">Mentor Advisory Console</h1>
          <p className="text-xs text-amber-100 mt-1">
            Tracking holistic academic wellness, performance interventions, and mentee counselling records.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/mentor/counselling"
            className="bg-white text-amber-900 text-xs font-bold px-4 py-2.5 rounded-xl shadow hover:bg-amber-50 transition flex items-center gap-1.5"
          >
            <span>Counselling History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Mentees</span>
            <span className="text-3xl font-black text-slate-900 block mt-1 font-mono">{mentees.length}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Under direct academic mentorship</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">At-Risk Students</span>
            <span className="text-3xl font-black text-rose-600 block mt-1 font-mono">{atRiskCount}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{needsAttnCount} student(s) need attention</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cohort Avg Attendance</span>
            <span className="text-3xl font-black text-slate-900 block mt-1 font-mono">{avgAtt}%</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Threshold target: 75%</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Mentees Diagnostic Overview */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Mentee Performance & Diagnostic Alerts</h2>
          <span className="text-xs text-slate-400 font-mono">{mentees.length} Active Records</span>
        </div>

        <div className="divide-y divide-slate-100">
          {mentees.map(m => {
            const isAtRisk = m.risk_category === 'AT_RISK';
            return (
              <div key={m.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{m.name}</span>
                    <span className="text-xs font-mono text-slate-400">({m.register_number})</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isAtRisk ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {m.risk_category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>Attendance: <strong className={m.attendance_percentage < 75 ? 'text-rose-600' : 'text-slate-800'}>{m.attendance_percentage}%</strong></span>
                    <span>Marks: <strong className="text-slate-800">{m.academic_percentage}%</strong></span>
                    {m.last_counselling_date && (
                      <span className="text-indigo-600 font-medium">Last Session: {m.last_counselling_date}</span>
                    )}
                  </div>
                  {m.risk_reasons?.length > 0 && (
                    <div className="text-xs text-rose-700 mt-1 italic">
                      Flags: {m.risk_reasons.join('; ')}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/mentor/counselling"
                    className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition"
                  >
                    View / Log Session
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
