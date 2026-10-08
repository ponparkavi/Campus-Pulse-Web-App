import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FileText, Plus, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function RequestsStudent() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [requestType, setRequestType] = useState('BONAFIDE');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    api.get('/requests')
      .then(res => {
        setRequests(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/requests', {
        request_type: requestType,
        reason
      });
      setShowModal(false);
      setReason('');
      loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading student requests...</div>;
  }

  const statusBadge = (status: string) => {
    if (status === 'APPROVED') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approved</span>
        </span>
      );
    }
    if (status === 'REJECTED') {
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
        <span>Pending Processing</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Institutional Requests & Certificates</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Apply digitally for Bonafide Certificates, No-Due Clearance, Fee Receipts, and Academic Concessions.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Certificate Request</span>
        </button>
      </div>

      {/* Requests List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Submitted Requests</h2>

        {requests.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No requests submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {req.request_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Stage: {req.stage || 'ADMIN'}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1.5 font-medium">{req.reason}</p>
                  {req.remarks && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      Remarks: "{req.remarks}"
                    </p>
                  )}
                </div>
                <div>{statusBadge(req.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">Submit Institutional Request</h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Request Type</label>
                <select
                  value={requestType}
                  onChange={e => setRequestType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                >
                  <option value="BONAFIDE">Bonafide Certificate</option>
                  <option value="NO_DUE">No Due Clearance</option>
                  <option value="ACADEMIC_REQUEST">Academic Special Permission</option>
                  <option value="FEE_REQUEST">Fee Concession / Splitting</option>
                  <option value="DOCUMENT_REQUEST">Official Transcript / Documents</option>
                  <option value="OTHER">Other Institutional Request</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Purpose of Request *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify purpose (e.g. Passport application, Education loan, Bus concession)..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-700 border rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
