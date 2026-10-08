import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Bell, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    api.get('/notifications')
      .then(res => {
        setNotifications(res.data);
        setLoading(false);
      })
      .catch(console.error);
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-gray-500">Loading notifications...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <button 
          onClick={markAllAsRead}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition"
        >
          <CheckCircle className="w-4 h-4 mr-1" /> Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className={`p-4 transition ${n.is_read ? 'bg-white' : 'bg-blue-50/50'}`}
                onClick={() => !n.is_read && markAsRead(n.id)}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-full mr-4 ${n.is_read ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm font-semibold ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm ${n.is_read ? 'text-gray-500' : 'text-gray-700'}`}>{n.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">You have no notifications right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
