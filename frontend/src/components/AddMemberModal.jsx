import React, { useState, useEffect } from 'react';
import { X, Loader2, Search } from 'lucide-react';
import { usersApi } from '../api/usersApi';
import Avatar from './Avatar';

const ROLE_OPTIONS = ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'VIEWER'];

export default function AddMemberModal({ open, onClose, onAdd }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [role, setRole] = useState('DEVELOPER');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); setSelected(null); setRole('DEVELOPER'); setError(''); }
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      usersApi.search(query.trim()).then((res) => setResults(res.data.data.users));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return setError('Select a user to add');
    setSubmitting(true);
    setError('');
    try {
      await onAdd({ email: selected.email, role });
      onClose();
    } catch (err) {
      setError(err.normalizedMessage || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-sm p-5 shadow-glass">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">Add Team Member</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Search by name, username or email</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input pl-8" placeholder="Search users…" value={query} onChange={(e) => { setQuery(e.target.value); setSelected(null); }} />
            </div>
            {results.length > 0 && !selected && (
              <div className="mt-2 border border-border rounded-lg divide-y divide-border max-h-40 overflow-y-auto">
                {results.map((u) => (
                  <button type="button" key={u._id} onClick={() => { setSelected(u); setQuery(u.fullName); setResults([]); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface2 text-left">
                    <Avatar user={u} size={26} />
                    <div>
                      <p className="text-sm text-ink">{u.fullName}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Project role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
