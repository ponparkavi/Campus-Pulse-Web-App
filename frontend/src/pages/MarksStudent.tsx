import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, BookOpen, AlertCircle, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export default function MarksStudent() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/me/profile')
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
        Loading Academic Diagnostics...
      </div>
    );
  }

  const perf = profile?.performance_summary;
  const overallPct = perf?.overall_percentage ?? 0;
  const isPass = perf?.status === 'PASS';

  const chartData = perf?.subject_scores?.map((s: any) => ({
    name: s.code || s.subject_name.slice(0, 10),
    percentage: s.percentage,
    fullName: s.subject_name
  })) || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Academic Performance & Analytics</h1>
        <p className="text-xs text-slate-500">Evaluation records across Internal Assessments and Term Examinations.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Aggregate</p>
            <p className={`text-3xl font-black mt-1 ${overallPct >= 50 ? 'text-slate-900' : 'text-rose-600'}`}>
              {overallPct}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Passing threshold: 50%</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Standing</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xl font-extrabold ${isPass ? 'text-emerald-700' : 'text-amber-700'}`}>
                {perf?.status || 'PASS'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Passed: {perf?.pass_count || 0} • Needs Improvement: {perf?.fail_count || 0}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${isPass ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {isPass ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Evaluated Tests</p>
            <p className="text-3xl font-black text-slate-900 mt-1 font-mono">
              {perf?.total_assessments || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Across enrolled department subjects</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Strong vs Weak Subjects Advisory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-emerald-900">Strong Subjects (≥ 75% Score)</span>
            {perf?.strong_subjects && perf.strong_subjects.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {perf.strong_subjects.map((sub: string, i: number) => (
                  <span key={i} className="text-xs bg-white text-emerald-800 font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
                    {sub}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-800/80 mt-1">Keep striving to push courses past 75%.</p>
            )}
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-amber-900">Focus Areas / Weak Subjects (&lt; 50% Score)</span>
            {perf?.weak_subjects && perf.weak_subjects.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {perf.weak_subjects.map((sub: string, i: number) => (
                  <span key={i} className="text-xs bg-white text-amber-900 font-semibold px-2.5 py-1 rounded-md border border-amber-200">
                    {sub}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-800/80 mt-1">No weak subjects detected. Excellent consistency!</p>
            )}
          </div>
        </div>
      </div>

      {/* Chart & Subject Details Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recharts Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Subject Performance Comparison</h2>
            <p className="text-xs text-slate-400 mb-4">Average scored percentage per subject</p>
            
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(val: any) => [`${val}%`, 'Score']}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                    />
                    <Bar dataKey="percentage" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">No assessment marks found.</p>
            )}
          </div>
        </div>

        {/* Detailed Marks Breakdown Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Assessment Breakdown</h2>
            <p className="text-xs text-slate-400 mb-4">Detailed internal test marks and maximum scores</p>

            <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
              {perf?.subject_scores?.map((subj: any, i: number) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-xs text-slate-900">{subj.subject_name}</span>
                      <span className="text-[11px] text-slate-400 font-mono ml-2">({subj.code})</span>
                    </div>
                    <span className="text-xs font-extrabold font-mono text-indigo-700">
                      {subj.percentage}% Avg
                    </span>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-200/60 pt-2 text-xs">
                    {subj.scores?.map((sc: any, scIdx: number) => (
                      <div key={scIdx} className="flex justify-between items-center text-slate-600">
                        <span className="font-medium text-[11px]">{sc.exam_type}</span>
                        <div className="font-mono flex items-center gap-2">
                          <span>{sc.score} / {sc.max_score}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            sc.percentage >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {sc.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
