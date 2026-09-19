import React, { useState } from 'react';
import { User, Shield, Palette } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('profile');

  return (
    <AppLayout title="Settings">
      <div className="flex gap-2 mb-5 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 transition-colors ${tab === id ? 'border-accent text-ink font-medium' : 'border-transparent text-muted hover:text-ink'}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card p-5 max-w-lg">
          <div className="flex items-center gap-3 mb-5">
            <Avatar user={user} size={56} />
            <div>
              <p className="font-semibold text-ink">{user?.fullName}</p>
              <p className="text-sm text-muted">@{user?.username}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Full name</label>
              <input className="input" defaultValue={user?.fullName} disabled />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
              <input className="input" defaultValue={user?.email} disabled />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Role</label>
              <input className="input" defaultValue={user?.role?.replace('_', ' ')} disabled />
            </div>
            <button onClick={() => toast.info('Profile editing is not wired up in this demo build yet.')} className="btn-primary">Save Changes</button>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="card p-5 max-w-lg space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Current password</label>
            <input type="password" className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">New password</label>
            <input type="password" className="input" placeholder="At least 8 characters" />
          </div>
          <button onClick={() => toast.info('Password change is not wired up in this demo build yet.')} className="btn-primary">Update Password</button>
        </div>
      )}

      {tab === 'appearance' && (
        <div className="card p-5 max-w-lg">
          <p className="text-sm text-ink font-medium mb-1">Dark mode</p>
          <p className="text-sm text-muted mb-4">DevCollab AI is designed dark-first for a focused developer experience. Light mode is not available yet.</p>
        </div>
      )}
    </AppLayout>
  );
}
