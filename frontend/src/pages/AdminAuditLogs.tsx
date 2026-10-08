import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldCheck, Clock, User, Filter, Search } from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/audit/logs')
      .then(res => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Security & Audit Trail...</div>;
  }

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase()) ||
    (l.user_email && l.user_email.toLowerCase().includes(search.toLowerCase())) ||
    (l.description && l.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-slate-900" />
            <span>Institutional Audit Trail & System Logs</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident activity logs for user authentication, marks entry, attendance modifications, and approvals.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search action or email..."
            className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Activity Log Entries</h2>
          <span className="text-xs text-slate-400 font-mono">{filtered.length} Recorded Actions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-sans font-medium">
                    {log.user_email || 'System'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 font-sans">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-indigo-700 font-bold font-sans">
                    {log.entity}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-sans">
                    {log.description || '—'}
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
