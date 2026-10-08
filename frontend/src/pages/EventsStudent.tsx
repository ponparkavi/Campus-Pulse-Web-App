import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, MapPin, Tag } from 'lucide-react';

export default function EventsStudent() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    api.get('/events')
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(console.error);
  };

  const registerForEvent = async (id: number) => {
    try {
      await api.post(`/events/${id}/register`);
      setMessage('Successfully registered for event');
      setTimeout(() => setMessage(''), 3000);
      // In a real app we'd fetch registration status too, but keeping it simple
    } catch (err) {
      setMessage('Registration failed or already registered');
    }
  };

  if (loading) return <p className="text-gray-500">Loading events...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Campus Events</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.length > 0 ? events.map(e => (
          <div key={e.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold text-gray-800">{e.title}</h2>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">{e.category}</span>
            </div>
            <p className="text-sm text-gray-600 flex-1 mb-4">{e.description}</p>
            
            <div className="space-y-2 mb-6">
              {e.date && (
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-2" /> {new Date(e.date).toLocaleDateString()}
                </div>
              )}
              {e.venue && (
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mr-2" /> {e.venue}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => registerForEvent(e.id)}
              className="mt-auto w-full bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition"
            >
              Register
            </button>
          </div>
        )) : (
          <p className="text-gray-500 col-span-full">No events found.</p>
        )}
      </div>
    </div>
  );
}
