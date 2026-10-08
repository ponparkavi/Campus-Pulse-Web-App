import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  HeartHandshake, User, Clock, BarChart3, AlertTriangle, 
  DollarSign, CheckCircle2, Award, Phone, Calendar 
} from 'lucide-react';

export default function ParentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/parent')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Parent Guardian Portal...</div>;
  }

  const stu = data?.student;
  const att = data?.attendance;
  const perf = data?.performance;
  const fee = data?.fee;
  const isBelowAtt = (att?.attendance_percentage ?? 0) < 75;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-pink-700 via-rose-700 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-pink-200 bg-white/10 px-3 py-1 rounded-full">
            Parent & Guardian Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2 tracking-tight">
            Academic Monitoring for {stu?.name}
          </h1>
          <p className="text-xs text-pink-100 mt-1">
            Register No: <span className="font-mono font-bold">{stu?.register_number}</span> • Department: {stu?.department} • Year {stu?.year} Sem {stu?.semester}
          </p>
        </div>

        {data?.mentor && (
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/15 text-xs text-left">
            <span className="text-[11px] text-pink-200 block font-semibold">Assigned Faculty Mentor:</span>
            <span className="font-bold text-white block mt-0.5">{data.mentor.name}</span>
            <span className="text-[11px] text-slate-300 font-mono">Tel: {data.mentor.phone || 'Campus Extension'}</span>
          </div>
        )}
      </div>

      {/* Critical Advisory Alerts if Any */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Academic Standing Notices for Parent Attention:</span>
          </div>
          <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 mt-1">
            {data.alerts.map((al: string, i: number) => (
              <li key={i}>{al}</li>
            ))}
          </ul>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-black ${isBelowAtt ? 'text-rose-600' : 'text-slate-900'}`}>
              {att?.attendance_percentage || 0}%
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isBelowAtt ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isBelowAtt ? 'Below 75%' : 'Satisfactory'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Attended: {att?.present_count + att?.od_count} / {att?.total_classes} sessions
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Internal Performance</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-900">
              {perf?.overall_percentage || 0}%
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${perf?.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {perf?.status || 'PASS'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Passed: {perf?.pass_count || 0} • Tests To Improve: {perf?.fail_count || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Tuition Fees</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ₹{fee ? fee.paid_amount : 0}
            </span>
            <span className="text-xs text-slate-400">of ₹{fee ? fee.total_amount : 0}</span>
          </div>
          <p className="text-[11px] font-bold text-rose-600 mt-2">
            Balance Due: ₹{fee ? fee.total_amount - fee.paid_amount : 0}
          </p>
        </div>
      </div>

      {/* Subject-Wise Academic Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Subject-Wise Academic & Attendance Report
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Subject Name</th>
                <th className="py-2.5 px-3 text-center">Sessions Held</th>
                <th className="py-2.5 px-3 text-center">Classes Attended</th>
                <th className="py-2.5 px-3 text-center">Attendance %</th>
                <th className="py-2.5 px-3 text-right">Academic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {att?.subject_breakdown?.map((s: any) => (
                <tr key={s.subject_id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900">{s.subject_name}</span>
                    <span className="text-[11px] text-slate-400 font-mono ml-2">({s.subject_code})</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">{s.total}</td>
                  <td className="py-3 px-3 text-center font-mono text-emerald-600 font-semibold">{s.present + s.od}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold">
                    <span className={s.percentage < 75 ? 'text-rose-600' : 'text-slate-800'}>
                      {s.percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {s.percentage >= 75 ? 'Good' : 'Needs Attention'}
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
