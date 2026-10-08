import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Mail, Send, CheckCircle2, Clock, Inbox, ShieldCheck } from 'lucide-react';

export default function EmailCommunicationPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState('student@campuspulse.com');
  const [subject, setSubject] = useState('Attendance & Academic Notice');
  const [template, setTemplate] = useState('ATTENDANCE_WARNING');
  const [body, setBody] = useState('This is an official notice regarding your academic standing and upcoming milestone requirements.');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    api.get('/email/logs')
      .then(res => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleTemplateChange = (t: string) => {
    setTemplate(t);
    if (t === 'ATTENDANCE_WARNING') {
      setSubject('Official Notice: Low Attendance Warning');
      setBody('Dear Student,\n\nYour attendance record indicates that your aggregate is currently below the mandatory 75% institutional threshold. Please consult your assigned Faculty Mentor immediately.');
    } else if (t === 'EVENING_CLASS') {
      setSubject('Academic Support Session Scheduled');
      setBody('Dear Student,\n\nAn Evening Academic Support tutorial session has been scheduled for Data Structures & Algorithms. Attendance is required.');
    } else if (t === 'PLACEMENT_ALERT') {
      setSubject('Urgent: Placement Drive Registration Open');
      setBody('Dear Student,\n\nGoogle Cloud and Microsoft have opened applications for final year recruitment. Please submit your application on the portal before the deadline.');
    } else {
      setSubject('Campus Institutional Announcement');
      setBody('Official circular from the Office of the Department Head / Principal.');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/email/send', {
        recipient_email: recipient,
        subject,
        body,
        template_name: template
      });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
      loadLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Communication Console...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-600" />
            <span>Campus Email & Broadcast Architecture</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulated development email dispatcher. Logs official notices to audit trails without requiring external SMTP credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composer Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            <span>Compose Institutional Notice</span>
          </h2>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Email dispatched and logged in security audit record successfully.</span>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Email Template</label>
              <select
                value={template}
                onChange={e => handleTemplateChange(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none bg-white font-medium"
              >
                <option value="ATTENDANCE_WARNING">Attendance Advisory Warning</option>
                <option value="EVENING_CLASS">Academic Support Tutorial Notice</option>
                <option value="PLACEMENT_ALERT">Placement Drive Recruitment Alert</option>
                <option value="GENERAL_CIRCULAR">General College Circular</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Recipient Email *</label>
              <input
                type="email"
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-mono"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject Header *</label>
              <input
                type="text"
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-semibold text-slate-900"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message Body *</label>
              <textarea
                rows={5}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none leading-relaxed font-sans"
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Dispatching...' : 'Dispatch Simulated Notice'}</span>
            </button>
          </form>
        </div>

        {/* Email Audit Log */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-500" />
              <span>Dispatched Mail Log Trail</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">{logs.length} Logged Entries</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No emails dispatched yet.</p>
            ) : (
              logs.map(l => (
                <div key={l.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-500 text-[11px]">{new Date(l.sent_at).toLocaleString()}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full">
                      {l.status}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900">{l.subject}</div>
                  <div className="text-[11px] text-slate-500 font-mono">To: {l.recipient_email}</div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 italic">"{l.body}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
