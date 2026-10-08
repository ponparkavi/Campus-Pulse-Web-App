import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/notifications/unread-count')
        .then(res => setUnreadCount(res.data.count))
        .catch(console.error);
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${user?.role.toLowerCase()}/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6 border-b border-gray-200">
      <div className="font-semibold text-xl text-blue-600">
        CampusPulse
      </div>
      
      {user && (
        <form onSubmit={handleSearch} className="hidden md:flex relative flex-1 max-w-md mx-6">
          <input 
            type="text" 
            placeholder="Search events, clubs, materials..." 
            className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-2.5" />
        </form>
      )}

      <div className="flex items-center space-x-6">
        {user && (
          <button 
            className="relative text-gray-500 hover:text-blue-600 transition"
            onClick={() => navigate(`/${user?.role.toLowerCase()}/notifications`)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        )}
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 font-medium text-sm hidden sm:block">{user?.email}</span>
          <button 
            onClick={logout}
            className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
