import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, Check, X, ExternalLink, Calendar, MapPin, User, Clock } from 'lucide-react';

export default function ODFaculty() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarksMap, setRemarksMap] = useState<Record<number, string>>({});
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    api.get('/od')
      .then(res => {
        setRequests(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleUpdateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id);
    try {
      await api.post(`/od/${id}/status`, {
        status,
        remarks: remarksMap[id] || (status === 'APPROVED' ? 'Approved for institutional participation.' : 'Request rejected.')
      });
      loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading On-Duty requests...</div>;
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const pastRequests = requests.filter(r => r.status !== 'PENDING');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <span>On Duty (OD) Approval Portal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review student OD applications. Approved requests automatically convert attendance sessions to "OD" status.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1.5 rounded-xl border border-amber-200">
            {pendingRequests.length} Pending
          </span>
          <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200">
            {pastRequests.length} Decided
          </span>
        </div>
      </div>

      {/* Pending Requests Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Pending Approvals ({pendingRequests.length})</span>
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 font-medium">
            No pending OD requests requiring faculty action.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(req => (
              <div key={req.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{req.student_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Reg: {req.register_number}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                    Awaiting Approval
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{req.event_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{req.organization || 'Organizing Body'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Date: <strong className="text-slate-800">{req.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Time: {req.start_time || '09:00 AM'} - {req.end_time || '05:00 PM'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Venue: {req.venue || 'Campus Venue'}</span>
                  </div>
                </div>

                <div className="text-xs bg-white p-3 rounded-xl border border-slate-200/80 text-slate-700">
                  <span className="font-bold text-slate-800">Stated Purpose: </span>
                  {req.purpose}
                </div>

                {req.proof_url && (
                  <div>
                    <a
                      href={req.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <span>Review Supporting Document / Letter</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Actions & Remarks */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="Enter approval or rejection remarks..."
                    className="flex-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={remarksMap[req.id] || ''}
                    onChange={e => setRemarksMap({ ...remarksMap, [req.id]: e.target.value })}
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                      disabled={processingId === req.id}
                      className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve OD</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                      disabled={processingId === req.id}
                      className="flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Decisions Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">OD Decision Audit Trail</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pastRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{req.student_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{req.register_number}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-medium">{req.event_name}</td>
                  <td className="py-3 px-3 text-slate-600 font-mono">{req.date}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 italic">{req.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
