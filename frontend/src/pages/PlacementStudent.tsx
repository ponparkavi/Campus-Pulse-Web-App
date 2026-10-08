import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Briefcase, Building2, MapPin, Calendar, CheckCircle2, Clock, Award, ArrowRight } from 'lucide-react';

export default function PlacementStudent() {
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  useEffect(() => {
    loadPlacementData();
  }, []);

  const loadPlacementData = () => {
    Promise.all([
      api.get('/placement/drives'),
      api.get('/placement/my-applications')
    ]).then(([dRes, aRes]) => {
      setDrives(dRes.data);
      setApplications(aRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const handleApply = async (driveId: number) => {
    setApplyingId(driveId);
    try {
      await api.post(`/placement/drives/${driveId}/apply`);
      loadPlacementData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Application error');
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Placement Ecosystem...</div>;
  }

  const appliedDriveIds = new Set(applications.map(a => a.drive_id));

  const statusPill = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">Selected / Offer Made 🎉</span>;
      case 'INTERVIEW':
        return <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-bold">Interview Scheduled</span>;
      case 'SHORTLISTED':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold">Shortlisted</span>;
      case 'REJECTED':
        return <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-xs font-bold">Not Selected</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold">Application Under Review</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 md:p-8 rounded-2xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-300 bg-white/10 px-3 py-1 rounded-full">
            Campus Placement Cell
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2 tracking-tight">Career Opportunities & Placement Drives</h1>
          <p className="text-xs text-indigo-200 mt-1">
            Apply to verified tier-1 recruitment drives and track application stages.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/10 text-center">
            <span className="text-xs text-indigo-200 block">Active Drives</span>
            <span className="text-2xl font-black">{drives.length}</span>
          </div>
          <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/10 text-center">
            <span className="text-xs text-indigo-200 block">Applied</span>
            <span className="text-2xl font-black">{applications.length}</span>
          </div>
        </div>
      </div>

      {/* My Applications Tracking */}
      {applications.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>My Placement Applications Tracker</span>
          </h2>

          <div className="space-y-3">
            {applications.map(app => (
              <div key={app.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{app.company_name}</span>
                    <span className="text-xs text-slate-400 font-mono">• {app.job_role}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-semibold text-emerald-700">
                    Package: {app.ctc_package}
                  </div>
                  {app.remarks && (
                    <p className="text-xs text-slate-600 mt-1 italic">
                      Placement Cell Note: "{app.remarks}"
                    </p>
                  )}
                </div>
                <div>{statusPill(app.status)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Drives Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-600" />
          <span>Available Campus Placement Drives</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drives.map(drive => {
            const hasApplied = appliedDriveIds.has(drive.id);
            return (
              <div key={drive.id} className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      <Building2 className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {drive.ctc_package}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">{drive.company_name}</h3>
                  <div className="text-xs font-semibold text-blue-600 mt-0.5">{drive.job_role}</div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {drive.description || 'Campus recruitment drive open for eligible students.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>Min CGPA: <strong className="text-slate-800">{drive.eligibility_cgpa}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Drive Date: {drive.drive_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: <strong className="text-rose-600">{drive.deadline}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{drive.location || 'Campus Center'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleApply(drive.id)}
                  disabled={hasApplied || applyingId === drive.id}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    hasApplied 
                      ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                  }`}
                >
                  {hasApplied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </>
                  ) : applyingId === drive.id ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
