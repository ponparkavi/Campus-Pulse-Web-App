import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AttendanceFaculty() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<number, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/subjects').then(res => setSubjects(res.data)).catch(console.error);
    api.get('/students').then(res => setStudents(res.data)).catch(console.error);
  }, []);

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !date) return;
    
    const records = Object.keys(attendanceData).map(studentId => ({
      student_id: parseInt(studentId),
      status: attendanceData[parseInt(studentId)]
    }));

    try {
      await api.post('/attendance', {
        subject_id: parseInt(selectedSubject),
        date,
        records
      });
      setMessage('Attendance saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Error saving attendance');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mark Attendance</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded text-sm font-medium">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select 
                required
                className="w-full p-2 border border-gray-300 rounded"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                required
                className="w-full p-2 border border-gray-300 rounded"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          {selectedSubject && students.length > 0 && (
            <>
              <table className="w-full text-left border-collapse mb-6">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 text-sm text-gray-600">Register No</th>
                    <th className="py-2 text-sm text-gray-600">Name</th>
                    <th className="py-2 text-sm text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 text-sm text-gray-800">{student.register_number}</td>
                      <td className="py-3 text-sm font-medium">{student.name}</td>
                      <td className="py-3">
                        <select 
                          className="p-1 border border-gray-300 rounded text-sm"
                          value={attendanceData[student.id] || 'PRESENT'}
                          onChange={e => handleStatusChange(student.id, e.target.value)}
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Save Attendance
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
