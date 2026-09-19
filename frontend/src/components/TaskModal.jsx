import React, { useState, useEffect } from 'react';
import { X, Loader2, Trash2, Send } from 'lucide-react';
import Avatar from './Avatar';
import { tasksApi } from '../api/tasksApi';
import { timeAgo } from '../utils/formatters';

const STATUS_OPTIONS = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'CODE_REVIEW', 'TESTING', 'DONE'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function TaskModal({ open, onClose, task, members, onSave, onDelete }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('BACKLOG');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const isEdit = Boolean(task?._id);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title || '');
    setDescription(task?.description || '');
    setStatus(task?.status || 'BACKLOG');
    setPriority(task?.priority || 'MEDIUM');
    setAssignedTo(task?.assignedTo?._id || task?.assignedTo || '');
    setDueDate(task?.dueDate ? task.dueDate.slice(0, 10) : '');
    setLabelsInput((task?.labels || []).join(', '));
    setError('');
    setComments([]);
    setCommentText('');

    if (isEdit) {
      setLoadingComments(true);
      tasksApi.get(task._id)
        .then((res) => setComments(res.data.data.comments))
        .catch(() => {})
        .finally(() => setLoadingComments(false));
    }
  }, [open, task]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError('Task title is required');
    setSubmitting(true);
    setError('');
    try {
      const labels = labelsInput.split(',').map((l) => l.trim()).filter(Boolean);
      await onSave({
        title: title.trim(),
        description,
        status,
        priority,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
        labels,
      });
      onClose();
    } catch (err) {
      setError(err.normalizedMessage || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isEdit) return;
    const res = await tasksApi.addComment(task._id, commentText.trim());
    setComments((prev) => [...prev, res.data.data.comment]);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-lg p-5 shadow-glass max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">{isEdit ? 'Edit Task' : 'New Task'}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fix login redirect bug" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Description</label>
            <textarea className="input min-h-[70px] resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more detail…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Priority</label>
              <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Assignee</label>
              <select className="input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                <option value="">Unassigned</option>
                {members.map((m) => <option key={m._id} value={m._id}>{m.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Due date</label>
              <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Labels (comma separated)</label>
            <input className="input" value={labelsInput} onChange={(e) => setLabelsInput(e.target.value)} placeholder="backend, bug" />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex justify-between items-center pt-1">
            {isEdit ? (
              <button type="button" onClick={() => onDelete(task._id)} className="btn-ghost text-danger hover:bg-danger/10">
                <Trash2 size={15} /> Delete
              </button>
            ) : <span />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>

        {isEdit && (
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-xs font-medium text-muted mb-3">Comments {comments.length > 0 && `(${comments.length})`}</h4>
            {loadingComments ? (
              <p className="text-xs text-muted">Loading comments…</p>
            ) : (
              <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
                {comments.length === 0 && <p className="text-xs text-muted">No comments yet.</p>}
                {comments.map((c) => (
                  <div key={c._id} className="flex gap-2">
                    <Avatar user={c.author} size={24} />
                    <div>
                      <p className="text-xs text-ink"><span className="font-medium">{c.author?.fullName}</span> <span className="text-muted ml-1">{timeAgo(c.createdAt)}</span></p>
                      <p className="text-sm text-ink mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input className="input" placeholder="Write a comment…" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
              <button type="submit" className="btn-secondary px-3"><Send size={15} /></button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
