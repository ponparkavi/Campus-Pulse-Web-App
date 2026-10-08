import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Briefcase, Building2, Plus, Users, Award, Check, X, Clock, ExternalLink } from 'lucide-react';

export default function AdminPlacements() {
  const [drives, setDrives] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Company Modal
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [compName, setCompName] = useState('');
  const [compIndustry, setCompIndustry] = useState('');
  const [compWebsite, setCompWebsite] = useState('');
  const [compEmail, setCompEmail] = useState('');

  // New Drive Modal
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveCompanyId, setDriveCompanyId] = useState<number | ''>('');
  const [jobRole, setJobRole] = useState('');
  const [ctcPackage, setCtcPackage] = useState('');
  const [eligibilityCgpa, setEligibilityCgpa] = useState('7.0');
  const [driveDate, setDriveDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [location, setLocation] = useState('');
  const [driveDesc, setDriveDesc] = useState('');

  // Applications Drawer / Modal
  const [selectedDrive, setSelectedDrive] = useState<any | null>(null);
  const [driveApplications, setDriveApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([
      api.get('/placement/drives'),
      api.get('/placement/companies'),
      api.get('/placement/analytics')
    ]).then(([dRes, cRes, aRes]) => {
      setDrives(dRes.data);
      setCompanies(cRes.data);
      setAnalytics(aRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/placement/companies', {
        name: compName,
        industry: compIndustry,
        website: compWebsite,
        contact_email: compEmail
      });
      setShowCompanyModal(false);
      setCompName('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/placement/drives', {
        company_id: Number(driveCompanyId),
        job_role: jobRole,
        ctc_package: ctcPackage,
        eligibility_cgpa: parseFloat(eligibilityCgpa),
        drive_date: driveDate,
        deadline,
        location,
        description: driveDesc
      });
      setShowDriveModal(false);
      setJobRole('');
      setCtcPackage('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewApplications = async (drive: any) => {
    setSelectedDrive(drive);
    setLoadingApps(true);
    try {
      const res = await api.get(`/placement/drives/${drive.id}/applications`);
      setDriveApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleUpdateStatus = async (appId: number, status: string) => {
    try {
      await api.patch(`/placement/applications/${appId}/status`, {
        status,
        remarks: `Updated by Placement Admin to ${status}`
      });
      if (selectedDrive) {
        handleViewApplications(selectedDrive);
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Placement Cell Admin...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-purple-600" />
            <span>Campus Placement Cell Administration</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage recruiting partners, schedule placement drives, and process student shortlists and offers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompanyModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
          >
            + Add Recruiter
          </button>
          <button
            onClick={() => setShowDriveModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm"
          >
            + Post Placement Drive
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Recruiting Partners</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{analytics?.total_companies || companies.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Active Drives</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{analytics?.total_drives || drives.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Applications</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{analytics?.total_applications || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Placement Rate</span>
          <span className="text-2xl font-black text-purple-600 font-mono mt-1 block">{analytics?.placement_rate || 0}%</span>
        </div>
      </div>

      {/* Drives Grid */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Scheduled Placement Drives</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drives.map(drive => (
            <div key={drive.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">{drive.company_name}</span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {drive.ctc_package}
                  </span>
                </div>
                <div className="text-xs font-semibold text-purple-700 mt-1">{drive.job_role}</div>
                <div className="text-[11px] text-slate-500 mt-2 font-mono">
                  Drive Date: {drive.drive_date} • Deadline: {drive.deadline}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Min CGPA: {drive.eligibility_cgpa} • {drive.location}
                </div>
              </div>

              <button
                onClick={() => handleViewApplications(drive)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>View Applicants & Status</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Applications Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Applicants for {selectedDrive.company_name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{selectedDrive.job_role} • Package: {selectedDrive.ctc_package}</p>
              </div>
              <button onClick={() => setSelectedDrive(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {loadingApps ? (
              <p className="text-xs text-slate-500 py-6 text-center">Loading applicant submissions...</p>
            ) : driveApplications.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No students have applied to this drive yet.</p>
            ) : (
              <div className="space-y-3">
                {driveApplications.map(app => (
                  <div key={app.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{app.student_name}</div>
                      <div className="text-slate-500 font-mono">Reg: {app.register_number} • Year {app.year}</div>
                      <div className="text-[11px] text-indigo-700 mt-1 font-semibold">Status: {app.status}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                        className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded font-bold hover:bg-blue-200 transition text-[11px]"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'INTERVIEW')}
                        className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded font-bold hover:bg-purple-200 transition text-[11px]"
                      >
                        Interview
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'SELECTED')}
                        className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold hover:bg-emerald-200 transition text-[11px]"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                        className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded font-bold hover:bg-rose-200 transition text-[11px]"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">Add Recruiting Company</h3>
            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Company Name *</label>
                <input required type="text" value={compName} onChange={e => setCompName(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Industry</label>
                <input type="text" placeholder="e.g. Cloud Computing / SaaS" value={compIndustry} onChange={e => setCompIndustry(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Website</label>
                <input type="url" placeholder="https://..." value={compWebsite} onChange={e => setCompWebsite(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Contact Email</label>
                <input type="email" placeholder="campus@company.com" value={compEmail} onChange={e => setCompEmail(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowCompanyModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold">Save Company</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Drive Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">Schedule Placement Drive</h3>
            <form onSubmit={handleCreateDrive} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Company *</label>
                <select required value={driveCompanyId} onChange={e => setDriveCompanyId(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none bg-white">
                  <option value="">-- Choose Recruiter --</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Job Role *</label>
                  <input required type="text" placeholder="e.g. Software Engineer" value={jobRole} onChange={e => setJobRole(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Package (CTC) *</label>
                  <input required type="text" placeholder="e.g. 14.5 LPA" value={ctcPackage} onChange={e => setCtcPackage(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Min CGPA</label>
                  <input type="number" step="0.1" value={eligibilityCgpa} onChange={e => setEligibilityCgpa(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Drive Date *</label>
                  <input required type="date" value={driveDate} onChange={e => setDriveDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Deadline *</label>
                  <input required type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none" />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Location</label>
                <input type="text" placeholder="e.g. Bangalore / Chennai" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Role Description</label>
                <textarea rows={2} value={driveDesc} onChange={e => setDriveDesc(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowDriveModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold">Publish Drive</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
