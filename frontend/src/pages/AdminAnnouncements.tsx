import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Plus, Edit, Trash2, Megaphone } from 'lucide-react';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<{id?: number, title: string, content: string}>({ title: '', content: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnouncements = () => {
    setLoading(true);
    api.get('/announcements')
      .then(res => {
        setAnnouncements(res.data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentAnnouncement({ title: '', content: '' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (ann: any) => {
    setIsEditing(true);
    setCurrentAnnouncement(ann);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isEditing) {
        await api.put(`/announcements/${currentAnnouncement.id}`, currentAnnouncement);
      } else {
        await api.post('/announcements', currentAnnouncement);
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.delete(`/announcements/${id}`);
        fetchAnnouncements();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to delete announcement');
      }
    }
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Announcements Management</h1>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" /> New Announcement
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search announcements..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading announcements...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAnnouncements.length > 0 ? filteredAnnouncements.map(a => (
              <div key={a.id} className="p-5 hover:bg-gray-50 transition flex flex-col md:flex-row gap-4">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full h-fit flex-shrink-0">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-lg font-bold text-gray-800">{a.title}</h2>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{a.content}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(a)}
                      className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(a.id)}
                      className="flex items-center text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-gray-500">
                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No announcements found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">{isEditing ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {error && <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    required 
                    value={currentAnnouncement.title}
                    onChange={e => setCurrentAnnouncement({...currentAnnouncement, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea 
                    required 
                    rows={5}
                    value={currentAnnouncement.content}
                    onChange={e => setCurrentAnnouncement({...currentAnnouncement, content: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-y" 
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
