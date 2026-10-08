import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<{id?: number, code: string, name: string, department_id: number, semester: number, faculty_id: number | ''}>({ 
    code: '', name: '', department_id: 0, semester: 1, faculty_id: '' 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, deptsRes, facsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/departments'),
        api.get('/faculties')
      ]);
      setSubjects(subsRes.data);
      setDepartments(deptsRes.data);
      setFaculties(facsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentSubject({ code: '', name: '', department_id: departments[0]?.id || 0, semester: 1, faculty_id: '' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: any) => {
    setIsEditing(true);
    setCurrentSubject({
      id: sub.id,
      code: sub.code,
      name: sub.name,
      department_id: sub.department_id,
      semester: sub.semester,
      faculty_id: sub.faculty_id || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Format data
    const submitData = {
      ...currentSubject,
      department_id: Number(currentSubject.department_id),
      semester: Number(currentSubject.semester),
      faculty_id: currentSubject.faculty_id ? Number(currentSubject.faculty_id) : null
    };

    try {
      if (isEditing) {
        await api.put(`/subjects/${currentSubject.id}`, submitData);
      } else {
        await api.post('/subjects', submitData);
      }
      setIsModalOpen(false);
      api.get('/subjects').then(res => setSubjects(res.data));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await api.delete(`/subjects/${id}`);
        api.get('/subjects').then(res => setSubjects(res.data));
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to delete subject');
      }
    }
  };

  const filteredSubs = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Subjects Management</h1>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Subject
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search subjects..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading subjects...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-sm font-semibold text-gray-600">Code</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Subject Name</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Department</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Semester</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Faculty</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubs.length > 0 ? filteredSubs.map(s => {
                  const dept = departments.find(d => d.id === s.department_id);
                  const fac = faculties.find(f => f.id === s.faculty_id);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700 border border-gray-200">
                          {s.code}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-800">{s.name}</td>
                      <td className="p-4 text-sm text-gray-600">{dept?.code || '-'}</td>
                      <td className="p-4 text-sm text-gray-600">{s.semester}</td>
                      <td className="p-4 text-sm text-gray-600">{fac ? fac.name : <span className="text-gray-400 italic">Unassigned</span>}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-2"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No subjects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">{isEditing ? 'Edit Subject' : 'Add Subject'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {error && <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                  <input 
                    type="text" 
                    required 
                    value={currentSubject.code}
                    onChange={e => setCurrentSubject({...currentSubject, code: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                  <input 
                    type="text" 
                    required 
                    value={currentSubject.name}
                    onChange={e => setCurrentSubject({...currentSubject, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select 
                      required
                      value={currentSubject.department_id}
                      onChange={e => setCurrentSubject({...currentSubject, department_id: Number(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value={0} disabled>Select...</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <input 
                      type="number" 
                      min="1"
                      max="10"
                      required 
                      value={currentSubject.semester}
                      onChange={e => setCurrentSubject({...currentSubject, semester: Number(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Faculty (Optional)</label>
                  <select 
                    value={currentSubject.faculty_id}
                    onChange={e => setCurrentSubject({...currentSubject, faculty_id: e.target.value === '' ? '' : Number(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">Unassigned</option>
                    {faculties.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
