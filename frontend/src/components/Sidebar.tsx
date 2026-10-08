import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  links: { name: string; path: string; icon?: string }[];
}

export default function Sidebar({ links }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col border-r border-slate-800 shrink-0">
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">CampusPulse</h2>
          <p className="text-[11px] text-slate-400 font-medium">Digital College Ecosystem</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 text-sm custom-scrollbar">
        {links.map(link => {
          const isActive = location.pathname === link.path || (link.path !== '/' && link.path !== '/student' && link.path !== '/faculty' && link.path !== '/admin' && link.path !== '/mentor' && link.path !== '/hod' && link.path !== '/principal' && link.path !== '/parent' && location.pathname.startsWith(link.path));
          return (
            <Link 
              key={link.path}
              to={link.path}
              className={`flex items-center px-3.5 py-2 rounded-lg font-medium transition-all text-xs tracking-wide ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
        CampusPulse v2.4 • Active
      </div>
    </div>
  );
}
