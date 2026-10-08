import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Save, CheckCircle2, Shield } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    api.get('/settings')
      .then(res => {
        setSettings(res.data);
        const map: Record<string, string> = {};
        res.data.forEach((s: any) => {
          map[s.key] = s.value;
        });
        setFormValues(map);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSave = async (key: string, description: string) => {
    try {
      await api.put(`/settings/${key}`, {
        value: formValues[key],
        description
      });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 3000);
      loadSettings();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading System Settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-slate-900" />
            <span>Institutional Policies & System Settings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global governance rules: minimum attendance criteria, pass percentages, and active academic cycles.
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Configurable Thresholds</h2>

        <div className="space-y-4">
          {settings.map(s => {
            const isSaved = savedKey === s.key;
            return (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="max-w-md">
                  <div className="font-extrabold text-sm text-slate-900 font-mono">{s.key}</div>
                  <p className="text-slate-500 mt-0.5">{s.description || 'Configurable institutional policy'}</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    className="p-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-slate-900 text-xs font-mono font-bold bg-white w-full sm:w-48"
                    value={formValues[s.key] ?? s.value}
                    onChange={e => setFormValues({ ...formValues, [s.key]: e.target.value })}
                  />
                  <button
                    onClick={() => handleSave(s.key, s.description)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0"
                  >
                    {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaved ? 'Saved' : 'Update'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
