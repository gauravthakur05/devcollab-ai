import React from 'react';
import { CalendarRange, Play, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const STATUS_STYLES = {
  PLANNED: 'bg-surface2 text-muted border-border',
  ACTIVE: 'bg-mint-soft text-mint border-mint/30',
  COMPLETED: 'bg-accent-soft text-accent border-accent/30',
};

export default function SprintCard({ sprint, onStart, onComplete }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-ink">{sprint.name}</h3>
          <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
            <CalendarRange size={12} /> {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
          </p>
        </div>
        <span className={`badge border ${STATUS_STYLES[sprint.status]}`}>{sprint.status}</span>
      </div>
      {sprint.goal && <p className="text-sm text-muted mb-3">{sprint.goal}</p>}

      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>{sprint.stats.completedTasks}/{sprint.stats.totalTasks} tasks complete</span>
          <span>{sprint.stats.completionPercentage}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface2 overflow-hidden">
          <div className="h-full bg-mint rounded-full transition-all" style={{ width: `${sprint.stats.completionPercentage}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        {sprint.status === 'PLANNED' && (
          <button onClick={() => onStart(sprint)} className="btn-secondary text-xs py-1.5"><Play size={13} /> Start Sprint</button>
        )}
        {sprint.status === 'ACTIVE' && (
          <button onClick={() => onComplete(sprint)} className="btn-secondary text-xs py-1.5"><CheckCircle2 size={13} /> Complete Sprint</button>
        )}
      </div>
    </div>
  );
}
