import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDept, setCurrentDept] = useState<{id?: number, name: string, code: string}>({ name: '', code: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const fetchDepartments = () => {
    setLoading(true);
    api.get('/departments')
      .then(res => {
        setDepartments(res.data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentDept({ name: '', code: '' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (dept: any) => {
    setIsEditing(true);
    setCurrentDept(dept);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isEditing) {
        await api.put(`/departments/${currentDept.id}`, currentDept);
      } else {
        await api.post('/departments', currentDept);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/departments/${id}`);
        fetchDepartments();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to delete department');
      }
    }
  };

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Departments Management</h1>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Department
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search departments..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading departments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-sm font-semibold text-gray-600">ID</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Department Name</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Code</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDepts.length > 0 ? filteredDepts.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-500">{d.id}</td>
                    <td className="p-4 text-sm font-medium text-gray-800">{d.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700 border border-gray-200">
                        {d.code}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => openEditModal(d)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-2"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No departments found.</td>
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
              <h2 className="text-lg font-bold text-gray-800">{isEditing ? 'Edit Department' : 'Add Department'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {error && <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                  <input 
                    type="text" 
                    required 
                    value={currentDept.name}
                    onChange={e => setCurrentDept({...currentDept, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
                  <input 
                    type="text" 
                    required 
                    value={currentDept.code}
                    onChange={e => setCurrentDept({...currentDept, code: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase" 
                  />
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
