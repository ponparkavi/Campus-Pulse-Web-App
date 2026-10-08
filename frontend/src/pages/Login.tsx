import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, UserCheck, Award, Briefcase, Users, HeartHandshake, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', loginEmail);
      formData.append('password', loginPass);

      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const token = res.data.access_token;
      
      const userRes = await api.get('/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      login(token, userRes.data.user);
      const role = userRes.data.user.role;

      if (role === 'STUDENT') navigate('/student');
      else if (role === 'FACULTY') navigate('/faculty');
      else if (role === 'MENTOR') navigate('/mentor');
      else if (role === 'HOD') navigate('/hod');
      else if (role === 'PRINCIPAL') navigate('/principal');
      else if (role === 'PARENT') navigate('/parent');
      else if (role === 'ADMIN') navigate('/admin');
      else navigate('/student');

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoadingRole(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoadingRole('manual');
    await executeLogin(email, password);
  };

  const handleQuickDemo = async (roleName: string, demoEmail: string) => {
    setError('');
    setEmail(demoEmail);
    setPassword('password123');
    setLoadingRole(roleName);
    await executeLogin(demoEmail, 'password123');
  };

  const demoAccounts = [
    { role: 'Student', email: 'student@campuspulse.com', icon: GraduationCap, color: 'from-blue-600 to-indigo-600', badge: 'Alice (CSE Yr 3)' },
    { role: 'Faculty', email: 'faculty@campuspulse.com', icon: Briefcase, color: 'from-emerald-600 to-teal-600', badge: 'Dr. Turing (CSE)' },
    { role: 'Mentor', email: 'mentor@campuspulse.com', icon: Award, color: 'from-amber-600 to-orange-600', badge: 'Prof. Hopper' },
    { role: 'HOD', email: 'hod@campuspulse.com', icon: UserCheck, color: 'from-purple-600 to-violet-600', badge: 'Dr. Lovelace (CSE)' },
    { role: 'Principal', email: 'principal@campuspulse.com', icon: ShieldCheck, color: 'from-rose-600 to-red-600', badge: 'Dr. Hamilton' },
    { role: 'Parent', email: 'parent@campuspulse.com', icon: HeartHandshake, color: 'from-pink-600 to-rose-500', badge: 'Robert Smith' },
    { role: 'Admin', email: 'admin@campuspulse.com', icon: Users, color: 'from-slate-700 to-slate-900', badge: 'SysAdmin' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid md:grid-cols-5 gap-6 z-10">
        {/* Left Card: Form */}
        <div className="md:col-span-3 bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                CP
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">CampusPulse</h1>
                <p className="text-xs text-slate-500 font-medium">Integrated Academic Ecosystem</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
              <p className="text-sm text-slate-500">Sign in to your college institutional portal</p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-5 text-sm flex items-center space-x-2">
                <span className="font-semibold">•</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Official Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@campuspulse.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loadingRole !== null}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center space-x-2 text-sm disabled:opacity-75"
              >
                <span>{loadingRole === 'manual' ? 'Authenticating...' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">CampusPulse Autonomous College Operating System</p>
          </div>
        </div>

        {/* Right Card: Quick 1-Click Role Switcher */}
        <div className="md:col-span-2 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-800 flex flex-col justify-between text-white">
          <div>
            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800">
                Live Ecosystem Demo
              </span>
              <h3 className="text-base font-bold text-white mt-2">Instant Role Demo Logins</h3>
              <p className="text-xs text-slate-400 mt-0.5">Click any role to log in with full verified test data:</p>
            </div>

            <div className="space-y-2 mt-3">
              {demoAccounts.map(account => {
                const IconComponent = account.icon;
                const isLoading = loadingRole === account.role;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleQuickDemo(account.role, account.email)}
                    disabled={loadingRole !== null}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition group text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center text-white shadow-sm`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-300 transition">{account.role}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{account.badge}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition">
                      {isLoading ? 'Loading...' : 'Launch →'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
            Default Password for all: <code className="text-blue-400 font-mono">password123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
