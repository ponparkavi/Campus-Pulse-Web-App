import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function TimetableStudent() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/timetable'),
      api.get('/exams')
    ]).then(([ttRes, exRes]) => {
      setTimetable(ttRes.data);
      setExams(exRes.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <p className="text-gray-500">Loading schedule...</p>;

  // Group timetable by day
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const groupedTt = days.map(day => ({
    day,
    classes: timetable.filter(t => t.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time))
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Timetable & Exams</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Class Timetable</h2>
          <div className="space-y-6">
            {groupedTt.map((group) => (
              <div key={group.day} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">{group.day}</h3>
                {group.classes.length > 0 ? (
                  <div className="space-y-3">
                    {group.classes.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-800">{c.subject_id}</p>
                          <p className="text-sm text-gray-500">Room: {c.room}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">{c.start_time} - {c.end_time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No classes scheduled.</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Exam Schedule</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {exams.length > 0 ? (
              <div className="space-y-4">
                {exams.map(e => (
                  <div key={e.id} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 rounded-r pr-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800">{e.name}</h3>
                        <p className="text-sm text-gray-600">Subject ID: {e.subject_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">{new Date(e.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">{e.time}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Room: {e.room}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No exams scheduled at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
