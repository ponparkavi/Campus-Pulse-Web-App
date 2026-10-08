import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function EveningClassesFaculty() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRecommendations();
    api.get('/subjects').then(res => setSubjects(res.data)).catch(console.error);
  }, []);

  const fetchRecommendations = () => {
    api.get('/evening-classes/recommendations').then(res => setRecommendations(res.data)).catch(console.error);
  };

  const handleStudentToggle = (id: number) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(s => s !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      setMessage('Please select at least one student.');
      return;
    }
    try {
      await api.post('/evening-classes', {
        subject_id: parseInt(subjectId),
        date,
        time,
        student_ids: selectedStudents
      });
      setMessage('Evening class scheduled successfully');
      setSubjectId(''); setDate(''); setTime(''); setSelectedStudents([]);
      fetchRecommendations();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Error scheduling class');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Evening Class Support</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          {message}
        </div>
      )}

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700 font-bold">
              System Recommendation — Faculty Decision Required
            </p>
            <p className="text-sm text-yellow-600 mt-1">
              The system automatically identifies students struggling with attendance or marks. You must review and decide whether to assign an evening class.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommended Students</h2>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-h-96 overflow-y-auto">
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map(r => (
                  <div key={r.student_id} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => handleStudentToggle(r.student_id)}>
                    <input type="checkbox" className="mt-1 mr-3 cursor-pointer" checked={selectedStudents.includes(r.student_id)} readOnly />
                    <div>
                      <p className="font-semibold text-gray-800">{r.name} <span className="text-xs text-gray-500 font-normal">({r.register_number})</span></p>
                      <ul className="list-disc pl-4 mt-1">
                        {r.reasons.map((reason: string, i: number) => (
                          <li key={i} className="text-xs text-red-600">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recommendations currently.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Schedule Class</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select required className="w-full p-2 border border-gray-300 rounded" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" required className="w-full p-2 border border-gray-300 rounded" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" required className="w-full p-2 border border-gray-300 rounded" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-700 mb-3">Selected Students: {selectedStudents.length}</p>
                <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" disabled={selectedStudents.length === 0}>
                  Schedule Class & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
