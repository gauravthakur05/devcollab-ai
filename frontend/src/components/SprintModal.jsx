import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function SprintModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(''); setGoal(''); setStartDate(''); setEndDate(''); setError('');
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Sprint name is required');
    if (!startDate || !endDate) return setError('Start and end dates are required');
    if (new Date(endDate) <= new Date(startDate)) return setError('End date must be after start date');
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), goal, startDate, endDate });
      onClose();
    } catch (err) {
      setError(err.normalizedMessage || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md p-5 shadow-glass">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">New Sprint</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Sprint name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sprint 13 — Notifications" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Goal</label>
            <textarea className="input min-h-[70px] resize-none" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What should this sprint achieve?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Start date</label>
              <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">End date</label>
              <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Create Sprint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
