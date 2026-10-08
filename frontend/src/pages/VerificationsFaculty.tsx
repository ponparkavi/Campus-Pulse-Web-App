import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, Check, X, ExternalLink, Calendar, User, Clock } from 'lucide-react';

export default function VerificationsFaculty() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = () => {
    api.get('/achievements/pending')
      .then(res => {
        setAchievements(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleVerify = async (id: number, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.patch(`/achievements/${id}/verify`, { verification_status: status });
      loadPending();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Portfolio Verifications...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <span>Digital Student Academic Identity Verifications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review student achievement submissions (Hackathons, Certifications, Paper Presentations, Competitions) and certify them for official portfolios.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
          {achievements.length} Pending Verifications
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pending Student Submissions</h2>

        {achievements.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 font-medium">
            No student achievements pending verification at this time.
          </div>
        ) : (
          <div className="space-y-3.5">
            {achievements.map(ach => (
              <div key={ach.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{ach.student_name}</span>
                    <span className="text-xs font-mono text-slate-400">({ach.register_number})</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase">
                      {ach.category}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-800">{ach.title}</div>
                  {ach.description && <p className="text-xs text-slate-600">{ach.description}</p>}
                  {ach.proof_url && (
                    <a
                      href={ach.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline font-semibold inline-flex items-center gap-1 mt-1"
                    >
                      <span>View Credential Certificate</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleVerify(ach.id, 'VERIFIED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verify & Certify</span>
                  </button>
                  <button
                    onClick={() => handleVerify(ach.id, 'REJECTED')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
