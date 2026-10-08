import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, User, AlertTriangle, CheckCircle, Plus, Calendar, Clock, X } from 'lucide-react';

export default function MentorFaculty() {
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Counselling form
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMentees();
  }, []);

  const loadMentees = () => {
    api.get('/mentor/mentees')
      .then(res => {
        setMentees(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleOpenCounselling = (student: any) => {
    setSelectedStudent(student);
    setRemarks('');
    setActionPlan('');
    setFollowUpDate('');
    setShowModal(true);
  };

  const handleSubmitCounselling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await api.post('/mentor/counselling', {
        student_id: selectedStudent.id,
        session_date: sessionDate,
        remarks,
        action_plan: actionPlan,
        follow_up_date: followUpDate || null
      });
      setShowModal(false);
      loadMentees();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading assigned mentees...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <span>Faculty Mentorship & Counselling Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor assigned mentee academic trajectories, flag risk factors, and conduct structured counselling.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
          {mentees.length} Assigned Mentees
        </div>
      </div>

      {/* Mentees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mentees.map(m => {
          const isAtRisk = m.risk_category === 'AT_RISK';
          const isNeedsAttn = m.risk_category === 'NEEDS_ATTENTION';

          return (
            <div 
              key={m.id} 
              className={`p-5 rounded-2xl border transition bg-white flex flex-col justify-between space-y-4 ${
                isAtRisk ? 'border-rose-200 shadow-rose-100/50 shadow-sm' : 'border-slate-100 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{m.name}</h3>
                      <div className="text-xs text-slate-400 font-mono">Reg: {m.register_number} • Yr {m.year} Sem {m.semester}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                    isAtRisk 
                      ? 'bg-rose-50 text-rose-700 border-rose-200' 
                      : isNeedsAttn 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {m.risk_category?.replace('_', ' ') || 'NORMAL'}
                  </span>
                </div>

                {/* Academic Metrics */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[11px] text-slate-500 font-semibold block">Attendance</span>
                    <span className={`text-lg font-black font-mono ${m.attendance_percentage < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {m.attendance_percentage}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[11px] text-slate-500 font-semibold block">Academic Marks</span>
                    <span className="text-lg font-black font-mono text-slate-800">
                      {m.academic_percentage}%
                    </span>
                  </div>
                </div>

                {/* Risk Reasons if any */}
                {m.risk_reasons && m.risk_reasons.length > 0 && (
                  <div className="mt-3 p-3 bg-rose-50/70 border border-rose-100 rounded-xl text-xs text-rose-800 space-y-1">
                    <span className="font-bold block">Diagnostic Flags:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {m.risk_reasons.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Last Counselling */}
                {m.last_counselling_date && (
                  <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">Last Session: </span>
                    <span className="font-mono text-slate-600">{m.last_counselling_date}</span>
                    <p className="mt-1 text-[11px] italic text-slate-600 line-clamp-2">"{m.last_counselling_remarks}"</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Tel: {m.phone || 'N/A'}</span>
                <button
                  onClick={() => handleOpenCounselling(m)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Counselling</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Counselling Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Mentoring Session</h3>
                <p className="text-xs text-slate-500 font-mono">Student: {selectedStudent.name} ({selectedStudent.register_number})</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCounselling} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Session Date *</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={sessionDate}
                    onChange={e => setSessionDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Next Follow-Up Date</label>
                  <input 
                    type="date" 
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={followUpDate}
                    onChange={e => setFollowUpDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observations & Mentoring Remarks *</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Detail discussions regarding attendance, internal test marks, study habits, or personal challenges..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agreed Action Plan / Milestones</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Mandatory attendance in evening support tutorial, daily 2h study schedule, parent check-in..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={actionPlan}
                  onChange={e => setActionPlan(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-sm"
                >
                  {submitting ? 'Saving...' : 'Save Counselling Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
