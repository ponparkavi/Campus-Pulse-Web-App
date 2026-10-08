import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function MaterialsFaculty() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMaterials();
    api.get('/subjects').then(res => setSubjects(res.data)).catch(console.error);
  }, []);

  const fetchMaterials = () => {
    api.get('/materials').then(res => setMaterials(res.data)).catch(console.error);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/materials', {
        title, description, file_url: fileUrl, subject_id: parseInt(subjectId)
      });
      setMessage('Material uploaded successfully');
      setTitle(''); setDescription(''); setFileUrl(''); setSubjectId('');
      fetchMaterials();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Error uploading material');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Study Materials</h1>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Material</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select required className="w-full p-2 border border-gray-300 rounded" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                <option value="">Select subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource URL / Link</label>
              <input type="url" required placeholder="https://example.com/file.pdf" className="w-full p-2 border border-gray-300 rounded" value={fileUrl} onChange={e => setFileUrl(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" required className="w-full p-2 border border-gray-300 rounded" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required className="w-full p-2 border border-gray-300 rounded" rows={3} value={description} onChange={e => setDescription(e.target.value)}></textarea>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Upload Material</button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Materials</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materials.map(m => (
            <div key={m.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{m.title}</h3>
              <p className="text-sm text-gray-600 flex-1 mb-4">{m.description}</p>
              <a 
                href={m.file_url} 
                target="_blank" 
                rel="noreferrer"
                className="mt-auto bg-gray-50 text-gray-700 px-4 py-2 rounded text-center text-sm font-medium hover:bg-gray-200 transition"
              >
                View Resource
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
