import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, Plus, CheckCircle2, Clock, XCircle, ExternalLink, Calendar, MapPin } from 'lucide-react';

export default function ODStudent() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [eventName, setEventName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [organization, setOrganization] = useState('');
  const [dateVal, setDateVal] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [venue, setVenue] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleApplyOD = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/od', {
        event_name: eventName,
        purpose,
        organization,
        date: dateVal,
        start_time: startTime,
        end_time: endTime,
        venue,
        proof_url: proofUrl
      });
      setShowModal(false);
      setEventName('');
      setPurpose('');
      setOrganization('');
      setDateVal('');
      setVenue('');
      setProofUrl('');
      loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading On-Duty applications...</div>;
  }

  const statusBadge = (st: string) => {
    if (st === 'APPROVED') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approved (OD Counted)</span>
        </span>
      );
    }
    if (st === 'REJECTED') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
          <XCircle className="w-3.5 h-3.5" />
          <span>Rejected</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
        <Clock className="w-3.5 h-3.5" />
        <span>Pending Approval</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            <span>On Duty (OD) Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Apply for institutional OD permissions for Hackathons, Paper Presentations, Sports, and Symposia.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New OD Application</span>
        </button>
      </div>

      {/* Applied OD List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">My Submitted OD Applications</h2>

        {requests.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50">
            <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No OD applications submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {requests.map(req => (
              <div key={req.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{req.event_name}</h3>
                    <p className="text-xs text-slate-500">{req.organization || 'Organizing Body'}</p>
                  </div>
                  {statusBadge(req.status)}
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
                    <span className="truncate">Venue: {req.venue || 'Campus Auditorium'}</span>
                  </div>
                </div>

                <div className="text-xs bg-white p-2.5 rounded-lg border border-slate-100 text-slate-700">
                  <strong>Purpose:</strong> {req.purpose}
                </div>

                {req.remarks && (
                  <div className="text-xs text-slate-600 italic">
                    Faculty Remarks: "{req.remarks}"
                  </div>
                )}

                {req.proof_url && (
                  <div className="pt-1">
                    <a 
                      href={req.proof_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Verification Document / Invitation Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">Apply On-Duty (OD) Permission</h3>

            <form onSubmit={handleApplyOD} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event / Competition Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Smart India Hackathon / IEEE Symposium"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Host Organization</label>
                  <input 
                    type="text" 
                    placeholder="e.g. IIT Bombay / AICTE"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Event *</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    value={dateVal}
                    onChange={e => setDateVal(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input 
                    type="text" 
                    placeholder="09:00 AM"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input 
                    type="text" 
                    placeholder="05:00 PM"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Auditorium / External College Campus"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purpose / Role in Event *</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Explain why you are representing the institution..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supporting Document / Proof URL</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 border hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  {submitting ? 'Submitting...' : 'Submit OD Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
