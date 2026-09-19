import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationsApi } from '../api/notificationsApi';
import { timeAgo } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch {
      // Silently ignore — the bell just stays empty; other UI surfaces backend errors.
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000); // light polling fallback alongside sockets
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleClickNotification = async (n) => {
    if (!n.isRead) {
      await notificationsApi.markRead(n._id);
      setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative p-2 rounded-lg hover:bg-surface2 text-muted hover:text-ink transition-colors">
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 card shadow-glass overflow-hidden z-40">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-medium text-sm text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-accent hover:underline flex items-center gap-1">
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">You're all caught up.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClickNotification(n)}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface2 transition-colors ${!n.isRead ? 'bg-accent-soft/30' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />}
                    <div className={!n.isRead ? '' : 'pl-3.5'}>
                      <p className="text-sm text-ink font-medium">{n.title}</p>
                      <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[11px] text-muted mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
