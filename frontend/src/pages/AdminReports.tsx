import React, { useState } from 'react';
import api from '../services/api';
import { FileSpreadsheet, Download, Filter, RefreshCw, Table } from 'lucide-react';

export default function AdminReports() {
  const [reportType, setReportType] = useState('attendance');
  const [reportTitle, setReportTitle] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/${reportType}`);
      setReportTitle(res.data.report_title);
      setReportData(res.data.data || []);
      setHasRun(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    const headers = Object.keys(reportData[0]);
    const csvRows = [
      headers.join(','),
      ...reportData.map(row => 
        headers.map(field => JSON.stringify(row[field] ?? '')).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <span>Institutional Reports & Data Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export consolidated audit reports across Attendance, Marks, At-Risk Diagnostics, Placements, and Fees.
          </p>
        </div>

        {reportData.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV</span>
          </button>
        )}
      </div>

      {/* Report Generator Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Report Configuration</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Domain *</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none bg-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="attendance">Student Attendance Audit Report</option>
              <option value="performance">Academic Marks & Term Performance</option>
              <option value="risk">At-Risk Student Diagnostic Report</option>
              <option value="placements">Campus Placement Drive Applications</option>
              <option value="fees">Student Tuition Fees & Outstanding</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Processing Data...' : 'Generate Live Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Results Table */}
      {hasRun && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-slate-900">{reportTitle}</h2>
            <span className="text-xs text-slate-400 font-mono">{reportData.length} Rows Extracted</span>
          </div>

          {reportData.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No records match the selected query criteria.</p>
          ) : (
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    {Object.keys(reportData[0]).map((k, i) => (
                      <th key={i} className="py-2.5 px-3 whitespace-nowrap">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-50 transition">
                      {Object.keys(row).map((k, colIdx) => (
                        <td key={colIdx} className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {String(row[k] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
