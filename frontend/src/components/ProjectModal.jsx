import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const STATUS_OPTIONS = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'];
const COLOR_OPTIONS = ['#6E56CF', '#22D3AA', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#A855F7'];

export default function ProjectModal({ open, onClose, onSubmit, initial }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PLANNING');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setDescription(initial?.description || '');
      setStatus(initial?.status || 'PLANNING');
      setDeadline(initial?.deadline ? initial.deadline.slice(0, 10) : '');
      setColor(initial?.color || COLOR_OPTIONS[0]);
      setError('');
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Project name is required');
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), description, status, deadline: deadline || undefined, color });
      onClose();
    } catch (err) {
      setError(err.normalizedMessage || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md p-5 shadow-glass max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">{initial ? 'Edit Project' : 'New Project'}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Project name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nimbus API Gateway" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Description</label>
            <textarea className="input min-h-[80px] resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Deadline</label>
              <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Color</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button type="button" key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface ring-ink' : ''}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {initial ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
