import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Building2, Users, Clock, BarChart3, AlertTriangle, ShieldCheck, 
  Briefcase, DollarSign, Calendar, TrendingUp, CheckCircle2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrincipalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/principal')
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
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Institutional Executive Portal...</div>;
  }

  const ca = data?.college_analytics;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-300 bg-white/10 px-3 py-1 rounded-full border border-rose-300/20">
            Office of the Principal • Executive Governance
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2 tracking-tight">
            Institutional Performance Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            College-wide oversight across 5 academic departments, attendance audits, pass rates, and placements.
          </p>
        </div>

        <div className="flex gap-2 text-xs font-bold">
          <div className="bg-white/10 px-3.5 py-2 rounded-xl text-center border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">Pending OD</span>
            <span className="text-base text-rose-300 font-mono">{data?.pending_approvals?.od || 0}</span>
          </div>
          <div className="bg-white/10 px-3.5 py-2 rounded-xl text-center border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">Pending Leaves</span>
            <span className="text-base text-amber-300 font-mono">{data?.pending_approvals?.leaves || 0}</span>
          </div>
        </div>
      </div>

      {/* College Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Departments</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{ca?.total_departments || 5}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Engineering Divisions</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Students</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{ca?.total_students || 0}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Faculty: {ca?.total_faculty || 0}</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
          <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">{ca?.attendance_percentage || 0}%</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">P: {ca?.present_count} • OD: {ca?.od_count}</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pass Rate</span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{ca?.pass_percentage || 0}%</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Fail: {ca?.fail_percentage}%</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Placement Rate</span>
          <span className="text-2xl font-black text-purple-600 font-mono mt-1 block">{ca?.placement_rate || 0}%</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Tier-1 Recruiters</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total At-Risk</span>
          <span className="text-2xl font-black text-rose-600 font-mono mt-1 block">{ca?.total_at_risk || 0}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Under Intervention</span>
        </div>
      </div>

      {/* Department Comparison Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-rose-600" />
            <span>Cross-Department Comparative Performance Audit</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">{ca?.department_breakdown?.length || 0} Divisions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Department Division</th>
                <th className="py-3 px-3 text-center">Students</th>
                <th className="py-3 px-3 text-center">Faculty</th>
                <th className="py-3 px-3 text-center">Attendance %</th>
                <th className="py-3 px-3 text-center">Pass %</th>
                <th className="py-3 px-3 text-center">At-Risk Count</th>
                <th className="py-3 px-3 text-right">Academic Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ca?.department_breakdown?.map((dept: any) => (
                <tr key={dept.department_id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-slate-900">{dept.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono ml-2">({dept.code})</span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-medium">{dept.student_count}</td>
                  <td className="py-3.5 px-3 text-center font-mono font-medium">{dept.faculty_count}</td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold">
                    <span className={dept.attendance_percentage < 75 && dept.student_count > 0 ? 'text-rose-600' : 'text-slate-800'}>
                      {dept.attendance_percentage}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-600">
                    {dept.pass_percentage}%
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold">
                    <span className={dept.at_risk_count > 0 ? 'text-rose-600' : 'text-slate-400'}>
                      {dept.at_risk_count}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      dept.attendance_percentage >= 75 || dept.student_count === 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {dept.attendance_percentage >= 75 || dept.student_count === 0 ? 'Optimal' : 'Intervention Needed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financials & Placements 2-Column Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Institutional Tuition Fee Collections</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Gross Billed Dues</span>
              <span className="font-mono font-bold text-slate-900">₹{ca?.total_fees}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Collected Funds</span>
              <span className="font-mono font-bold text-emerald-600">₹{ca?.paid_fees}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Total Outstanding Arrears</span>
              <span className="font-mono font-bold text-rose-600">₹{ca?.outstanding_fees}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-600" />
            <span>Placement Cell Summary</span>
          </h2>
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900 leading-relaxed">
            Leading recruiters including Google Cloud, Microsoft, and Zoho are actively running recruitment drives.
            Placement rate currently stands at <strong>{ca?.placement_rate}%</strong> across eligible final year cohorts.
          </div>
          <div className="pt-2 flex justify-end">
            <Link 
              to="/principal/placements" 
              className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
            >
              <span>Detailed Placement Analytics</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
