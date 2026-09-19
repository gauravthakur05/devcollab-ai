import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { notificationsApi } from '../api/notificationsApi';
import { useToast } from '../context/ToastContext';
import { timeAgo } from '../utils/formatters';

export default function NotificationsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    notificationsApi.list()
      .then((res) => setNotifications(res.data.data.notifications))
      .catch((err) => toast.error(err.normalizedMessage || 'Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleClick = async (n) => {
    if (!n.isRead) {
      await notificationsApi.markRead(n._id);
      setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppLayout title="Notifications">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">{unreadCount} unread</p>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="btn-secondary text-xs"><CheckCheck size={14} /> Mark all read</button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="You'll see task assignments, mentions, and updates here." />
      ) : (
        <div className="card divide-y divide-border overflow-hidden">
          {notifications.map((n) => (
            <button key={n._id} onClick={() => handleClick(n)} className={`w-full text-left px-4 py-3.5 hover:bg-surface2 transition-colors flex items-start gap-3 ${!n.isRead ? 'bg-accent-soft/20' : ''}`}>
              {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />}
              <div className={!n.isRead ? '' : 'pl-3.5'}>
                <p className="text-sm text-ink font-medium">{n.title}</p>
                <p className="text-sm text-muted mt-0.5">{n.message}</p>
                <p className="text-xs text-muted mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
