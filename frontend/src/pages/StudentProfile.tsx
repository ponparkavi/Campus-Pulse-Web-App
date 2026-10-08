import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  User, Award, Briefcase, Plus, CheckCircle, Clock, ShieldCheck, 
  ExternalLink, Sparkles, Phone, Mail, BookOpen, Edit2, Save, X 
} from 'lucide-react';

export default function StudentProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  
  // New Achievement Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('HACKATHON');
  const [description, setDescription] = useState('');
  const [achDate, setAchDate] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    api.get('/students/me/profile').then(res => {
      setProfile(res.data);
      setAchievements(res.data.achievements || []);
      setPhone(res.data.phone || '');
      setSkills(res.data.skills || '');
      setInterests(res.data.interests || '');
    }).catch(console.error);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/students/me/profile', { phone, skills, interests });
      setEditing(false);
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/achievements', {
        title,
        category,
        description,
        date: achDate,
        proof_url: proofUrl
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setAchDate('');
      setProofUrl('');
      loadProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) {
    return <div className="p-8 text-center text-slate-500">Loading student digital identity...</div>;
  }

  const categoryBadges: Record<string, string> = {
    HACKATHON: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    CERTIFICATION: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PAPER_PRESENTATION: 'bg-blue-50 text-blue-700 border-blue-200',
    INTERNSHIP: 'bg-purple-50 text-purple-700 border-purple-200',
    COMPETITION: 'bg-amber-50 text-amber-700 border-amber-200',
    WORKSHOP: 'bg-teal-50 text-teal-700 border-teal-200',
    SPORTS: 'bg-rose-50 text-rose-700 border-rose-200',
    CLUB: 'bg-slate-50 text-slate-700 border-slate-200'
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner with Profile Photo & Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 relative" />
        <div className="px-6 md:px-8 pb-6 relative flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-14">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md border border-slate-200 shrink-0">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-inner">
                {profile.name.charAt(0)}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold font-mono">
                  {profile.register_number}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {profile.department_name} • Class of Year {profile.year} (Semester {profile.semester})
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 shadow-sm"
            >
              {editing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              <span>{editing ? 'Cancel' : 'Edit Skills & Details'}</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Achievement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editing Form */}
      {editing && (
        <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Update Profile Details</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Technical Skills</label>
              <input 
                type="text" 
                value={skills} 
                onChange={e => setSkills(e.target.value)}
                placeholder="Python, React, Machine Learning, SQL..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Interests & Domains</label>
              <input 
                type="text" 
                value={interests} 
                onChange={e => setInterests(e.target.value)}
                placeholder="Cloud Architecture, Robotics, Open Source..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-blue-500 transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile Changes</span>
          </button>
        </form>
      )}

      {/* Identity Cards & Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Academic Profile Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Institutional Credentials</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Official Email</span>
              <span className="font-mono text-slate-800 font-semibold">{profile.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Department</span>
              <span className="font-semibold text-slate-800">{profile.department_code}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Current Semester</span>
              <span className="font-semibold text-slate-800">Semester {profile.semester}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Phone Contact</span>
              <span className="font-mono text-slate-800 font-semibold">{profile.phone || 'Not recorded'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Mentor</span>
              <span className="font-semibold text-blue-700">{profile.mentor?.name || 'Assigned Mentor'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-700 mb-2">Technical Skills</div>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills?.split(',').map((skill: string, i: number) => (
                <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <div className="text-xs font-bold text-slate-700 mb-2">Areas of Interest</div>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests?.split(',').map((interest: string, i: number) => (
                <span key={i} className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">
                  {interest.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Digital Academic Portfolio / Achievements */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Digital Academic Portfolio</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">{achievements.length} Verified Entries</span>
          </div>
          <p className="text-xs text-slate-500">
            Certifications, Hackathons, Competitions, Publications, and Sports verified by college faculty.
          </p>

          <div className="space-y-3.5 mt-4">
            {achievements.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">No achievements recorded yet.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                >
                  + Add First Achievement
                </button>
              </div>
            ) : (
              achievements.map((ach) => (
                <div key={ach.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${categoryBadges[ach.category] || 'bg-slate-100 text-slate-700'}`}>
                        {ach.category}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900">{ach.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {ach.verification_status === 'VERIFIED' ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Pending Verification</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {ach.description && (
                    <p className="text-xs text-slate-600 mt-1">{ach.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                    <span>Date: {ach.date || 'Recorded'}</span>
                    {ach.proof_url && (
                      <a 
                        href={ach.proof_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>View Certificate Proof</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal for adding achievement */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Academic Achievement</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAchievement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Competition Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. AWS Solutions Architect or PulseHacks Winner"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="HACKATHON">Hackathon</option>
                    <option value="CERTIFICATION">Certification</option>
                    <option value="PAPER_PRESENTATION">Paper / Research</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="COMPETITION">Technical Competition</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="SPORTS">Sports & Athletics</option>
                    <option value="CLUB">Club Activity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date Achieved</label>
                  <input 
                    type="date" 
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={achDate}
                    onChange={e => setAchDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  rows={2}
                  placeholder="Describe your achievement, project track, or score..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate / Proof Link</label>
                <input 
                  type="url" 
                  placeholder="https://credential.net/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                >
                  {submitting ? 'Submitting...' : 'Save Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
