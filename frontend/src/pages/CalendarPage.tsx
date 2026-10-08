import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar as CalendarIcon, Clock, MapPin, Tag, Bell, Plus, X, Trash2, Edit } from 'lucide-react';

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:00',
    event_type: 'Personal',
    location: '',
    reminder_time: '30 minutes before',
    priority: 'Medium'
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Fetch both personal events and system calendar events
      const personalRes = await api.get('/calendar/personal');
      const sysRes = await api.get('/calendar/events');
      setEvents([...personalRes.data, ...sysRes.data]);
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      };
      
      if (editId) {
        await api.put(`/calendar/personal/${editId}`, payload);
      } else {
        await api.post('/calendar/personal', payload);
      }
      setShowForm(false);
      setEditId(null);
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert('Error saving event');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/calendar/personal/${id}`);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (ev: any) => {
    setFormData({
      title: ev.title,
      description: ev.description || '',
      start_date: new Date(ev.start_date || ev.start).toISOString().split('T')[0],
      end_date: new Date(ev.end_date || ev.end).toISOString().split('T')[0],
      start_time: ev.start_time || '09:00',
      end_time: ev.end_time || '10:00',
      event_type: ev.event_type || 'Personal',
      location: ev.location || '',
      reminder_time: ev.reminder_time || '30 minutes before',
      priority: ev.priority || 'Medium'
    });
    setEditId(ev.id);
    setShowForm(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Calendar</h1>
        <button 
          onClick={() => {
            setEditId(null);
            setFormData({
              title: '', description: '', start_date: new Date().toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0], start_time: '09:00', end_time: '10:00',
              event_type: 'Personal', location: '', reminder_time: '30 minutes before', priority: 'Medium'
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">{editId ? 'Edit Event' : 'New Event'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                  <input required type="date" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value, end_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
                  <div className="flex items-center gap-2">
                    <input type="time" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                    <span className="text-gray-500">-</span>
                    <input type="time" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                  <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none" value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})}>
                    <option>Personal</option>
                    <option>Project meeting</option>
                    <option>Workshop</option>
                    <option>Club</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                  <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Important</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                  <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none" placeholder="e.g. Library" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reminder</label>
                  <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none" value={formData.reminder_time} onChange={e => setFormData({...formData, reminder_time: e.target.value})}>
                    <option>5 minutes before</option>
                    <option>15 minutes before</option>
                    <option>30 minutes before</option>
                    <option>1 hour before</option>
                    <option>1 day before</option>
                    <option>None</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea rows={2} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No events found</h3>
            <p className="text-gray-500 mt-2">Create a personal event or wait for system events to sync.</p>
          </div>
        ) : (
          events.map((ev, i) => {
            const isPersonal = ev.id && !String(ev.id).startsWith('cal') && !String(ev.id).startsWith('exam') && !String(ev.id).startsWith('event') && !String(ev.id).startsWith('drive') && !String(ev.id).startsWith('evening') && !String(ev.id).startsWith('od') && !String(ev.id).startsWith('leave');
            const eventDate = new Date(ev.start_date || ev.start).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            
            let colorCls = 'border-l-indigo-500 bg-white';
            if (ev.priority === 'High' || ev.priority === 'Important') colorCls = 'border-l-red-500 bg-red-50/30';
            if (!isPersonal) colorCls = 'border-l-amber-500 bg-amber-50/10';

            return (
              <div key={i} className={`flex flex-col sm:flex-row gap-4 p-5 rounded-xl border-y border-r border-l-4 border-gray-100 shadow-sm hover:shadow-md transition-shadow ${colorCls}`}>
                <div className="sm:w-32 flex-shrink-0 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-gray-100 pb-3 sm:pb-0 sm:pr-4">
                  <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider">{eventDate}</div>
                  <div className="text-lg font-bold text-gray-800 flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {ev.start_time || 'All Day'}
                  </div>
                </div>
                
                <div className="flex-grow flex flex-col justify-center">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{ev.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{ev.description}</p>
                    </div>
                    {isPersonal && (
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => handleEdit(ev)} className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(ev.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium text-gray-600">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md">
                      <Tag className="w-3.5 h-3.5 text-gray-500" /> {ev.event_type || ev.type}
                    </span>
                    {(ev.location || !isPersonal) && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" /> {ev.location || 'College Campus'}
                      </span>
                    )}
                    {ev.reminder_time && ev.reminder_time !== 'None' && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                        <Bell className="w-3.5 h-3.5" /> {ev.reminder_time}
                      </span>
                    )}
                    {!isPersonal && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md ml-auto">
                        Academic Event
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
