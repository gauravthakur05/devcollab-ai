import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import NotificationBell from './NotificationBell';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
      <h1 className="text-base font-semibold text-ink">{title}</h1>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <div className="relative" ref={ref}>
          <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-surface2 transition-colors">
            <Avatar user={user} size={30} />
            <div className="hidden sm:block text-left">
              <p className="text-sm text-ink font-medium leading-tight">{user?.fullName}</p>
              <p className="text-[11px] text-muted leading-tight">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown size={14} className="text-muted" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 card shadow-glass overflow-hidden z-40">
              <button onClick={() => { setMenuOpen(false); navigate('/settings'); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-surface2">
                <Settings size={15} /> Settings
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-surface2 border-t border-border">
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
