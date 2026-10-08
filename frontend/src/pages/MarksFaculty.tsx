import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SmartMarksImport from '../components/SmartMarksImport';

export default function MarksFaculty() {
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'IMPORT' | 'HISTORY'>('MANUAL');
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState('INTERNAL_1');
  const [maxScore, setMaxScore] = useState(100);
  const [marksData, setMarksData] = useState<Record<number, number>>({});
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get('/subjects').then(res => setSubjects(res.data)).catch(console.error);
    api.get('/students').then(res => setStudents(res.data)).catch(console.error);
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    api.get('/smart/marks/import/history').then(res => setHistory(res.data)).catch(console.error);
  };

  const handleScoreChange = (studentId: number, score: string) => {
    const val = parseFloat(score);
    if (val > maxScore) return;
    setMarksData(prev => ({ ...prev, [studentId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    
    const records = Object.keys(marksData).map(studentId => ({
      student_id: parseInt(studentId),
      score: marksData[parseInt(studentId)],
      max_score: maxScore
    }));

    try {
      await api.post('/marks', {
        subject_id: parseInt(selectedSubject),
        exam_type: examType,
        records
      });
      setMessage('Marks saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Error saving marks');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Assessments</h1>
        
        <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm inline-flex">
          <button 
            onClick={() => setActiveTab('MANUAL')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'MANUAL' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            Manual Entry
          </button>
          <button 
            onClick={() => setActiveTab('IMPORT')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'IMPORT' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            Smart Import
          </button>
          <button 
            onClick={() => {
              setActiveTab('HISTORY');
              fetchHistory();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'HISTORY' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            Import History
          </button>
        </div>
      </div>
      
      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium animate-pulse">
          {message}
        </div>
      )}

      {activeTab === 'MANUAL' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <select 
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                >
                  <option value="">Select a subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Type</label>
                <select 
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={examType}
                  onChange={e => setExamType(e.target.value)}
                >
                  <option value="INTERNAL_1">Internal 1</option>
                  <option value="INTERNAL_2">Internal 2</option>
                  <option value="SEMESTER">Semester</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Score</label>
                <input 
                  type="number" 
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={maxScore}
                  onChange={e => setMaxScore(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {selectedSubject && students.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="overflow-hidden border border-gray-200 rounded-xl mb-6">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Register No</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">{student.register_number}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{student.name}</td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              step="0.1"
                              max={maxScore}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              value={marksData[student.id] || ''}
                              onChange={e => handleScoreChange(student.id, e.target.value)}
                              placeholder="0.0"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg shadow-sm hover:bg-gray-800 hover:shadow transition-all"
                  >
                    Save All Marks
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {activeTab === 'IMPORT' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <SmartMarksImport />
        </div>
      )}
      
      {activeTab === 'HISTORY' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Import History</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No import history found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Matched</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Failed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">{new Date(h.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">{h.subject_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{h.source}</span>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-blue-600">{h.matched_rows}</td>
                      <td className="py-3 px-4 text-sm font-bold text-amber-600">{h.updated_rows}</td>
                      <td className="py-3 px-4 text-sm font-bold text-red-600">{h.failed_rows}</td>
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
