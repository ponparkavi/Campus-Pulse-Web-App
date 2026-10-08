import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AssignmentsFaculty() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // New assignment form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [message, setMessage] = useState('');

  // Submissions view state
  const [viewingSubmissions, setViewingSubmissions] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [evaluateMarks, setEvaluateMarks] = useState<Record<number, string>>({});
  const [evaluateFeedback, setEvaluateFeedback] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchAssignments();
    api.get('/subjects').then(res => setSubjects(res.data)).catch(console.error);
  }, []);

  const fetchAssignments = () => {
    api.get('/assignments').then(res => setAssignments(res.data)).catch(console.error);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assignments', {
        title, description, deadline, subject_id: parseInt(subjectId)
      });
      setMessage('Assignment created successfully');
      setTitle(''); setDescription(''); setDeadline(''); setSubjectId('');
      fetchAssignments();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Error creating assignment');
    }
  };

  const viewSubmissions = async (id: number) => {
    if (viewingSubmissions === id) {
      setViewingSubmissions(null);
      return;
    }
    try {
      const res = await api.get(`/assignments/${id}/submissions`);
      setSubmissions(res.data);
      setViewingSubmissions(id);
    } catch (err) {
      console.error(err);
    }
  };

  const submitEvaluation = async (subId: number) => {
    try {
      await api.post(`/assignments/submissions/${subId}/evaluate`, {
        marks: parseFloat(evaluateMarks[subId] || '0'),
        feedback: evaluateFeedback[subId] || ''
      });
      setMessage('Evaluation saved');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Assignments</h1>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Assignment</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input type="date" required className="w-full p-2 border border-gray-300 rounded" value={deadline} onChange={e => setDeadline(e.target.value)} />
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
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Create Assignment</button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Existing Assignments</h2>
        {assignments.map(a => (
          <div key={a.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-800">{a.title}</h3>
              <button onClick={() => viewSubmissions(a.id)} className="text-sm text-blue-600 hover:underline">
                {viewingSubmissions === a.id ? 'Hide Submissions' : 'View Submissions'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-2">Deadline: {new Date(a.deadline).toLocaleDateString()}</p>
            
            {viewingSubmissions === a.id && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Student Submissions</h4>
                {submissions.length > 0 ? submissions.map(sub => (
                  <div key={sub.id} className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm text-gray-800 mb-2"><strong>Content:</strong> {sub.feedback}</p>
                    <div className="flex gap-4 items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Marks</label>
                        <input type="number" className="p-1 border rounded w-20 text-sm" value={evaluateMarks[sub.id] || sub.marks || ''} onChange={e => setEvaluateMarks(prev => ({...prev, [sub.id]: e.target.value}))} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Feedback</label>
                        <input type="text" className="w-full p-1 border rounded text-sm" value={evaluateFeedback[sub.id] || (sub.status === 'EVALUATED' ? 'Evaluated' : '')} onChange={e => setEvaluateFeedback(prev => ({...prev, [sub.id]: e.target.value}))} />
                      </div>
                      <button onClick={() => submitEvaluation(sub.id)} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">Save</button>
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-500">No submissions yet.</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
