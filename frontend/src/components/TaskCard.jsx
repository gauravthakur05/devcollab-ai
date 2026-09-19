import React from 'react';
import { MessageSquare, CalendarDays } from 'lucide-react';
import Avatar from './Avatar';
import { PRIORITY_COLORS, formatDateShort } from '../utils/formatters';

export default function TaskCard({ task, onClick, draggable, onDragStart }) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className="card p-3 hover:border-accent/50 cursor-pointer transition-colors bg-surface2/60"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm text-ink font-medium leading-snug">{task.title}</p>
      </div>

      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.slice(0, 3).map((l) => (
            <span key={l} className="badge bg-surface border border-border text-muted text-[10px]">{l}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className={`badge border text-[10px] ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
        <div className="flex items-center gap-2 text-muted">
          {task.commentsCount > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]"><MessageSquare size={11} /> {task.commentsCount}</span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-0.5 text-[11px]"><CalendarDays size={11} /> {formatDateShort(task.dueDate)}</span>
          )}
          {task.assignedTo && <Avatar user={task.assignedTo} size={22} />}
        </div>
      </div>
    </div>
  );
}
