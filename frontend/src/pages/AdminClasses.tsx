import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, BookOpen } from 'lucide-react';

export default function AdminClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = () => {
    setLoading(true);
    api.get('/admin/classes')
      .then(res => {
        setClasses(res.data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Classes & Sections</h1>
        <p className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded border border-gray-200">
          Classes are automatically derived from enrolled students
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Loading classes...</div>
        ) : classes.length > 0 ? (
          classes.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-white">{c.department_name}</h2>
                    <p className="text-blue-100 text-sm mt-0.5">Year {c.year} • Semester {c.semester}</p>
                  </div>
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded">
                    Active
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex justify-between items-center bg-white border-t border-gray-50">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Students</p>
                    <p className="text-lg font-bold text-gray-800">{c.student_count}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mr-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Academic Group</p>
                    <p className="text-sm font-bold text-gray-800">UG Program</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-end">
                <button className="text-sm text-blue-600 font-medium hover:text-blue-800 transition px-2">
                  View Students →
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-8 text-center bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500">
            No classes found. Enroll students to see active classes here.
          </div>
        )}
      </div>
    </div>
  );
}
