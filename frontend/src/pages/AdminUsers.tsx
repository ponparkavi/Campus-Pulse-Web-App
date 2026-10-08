import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, UserCheck, UserX } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/status?status=${!currentStatus}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'All' || u.role === filter;
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {['All', 'STUDENT', 'FACULTY', 'ADMIN'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search name or email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Department</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-gray-800">{u.name}</td>
                    <td className="p-4 text-sm text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'FACULTY' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{u.department || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button 
                          onClick={() => toggleStatus(u.id, u.is_active)}
                          className={`p-1.5 rounded ${u.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={u.is_active ? "Deactivate" : "Activate"}
                        >
                          {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
