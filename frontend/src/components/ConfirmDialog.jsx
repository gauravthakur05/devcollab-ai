import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-sm p-5 shadow-glass">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${danger ? 'bg-danger/10 text-danger' : 'bg-accent-soft text-accent'}`}>
            <AlertTriangle size={18} />
          </div>
          <button onClick={onCancel} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <h3 className="font-semibold text-ink mb-1">{title}</h3>
        {description && <p className="text-sm text-muted mb-5">{description}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={onConfirm} className={danger ? 'btn bg-danger text-white hover:bg-red-600' : 'btn-primary'}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
