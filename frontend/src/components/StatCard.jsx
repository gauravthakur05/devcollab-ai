import React from 'react';

export default function StatCard({ label, value, icon: Icon, accent = 'accent', suffix = '' }) {
  const colorMap = {
    accent: 'bg-accent-soft text-accent',
    mint: 'bg-mint-soft text-mint',
    warn: 'bg-warn/10 text-warn',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
  };
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[accent]}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-ink tabular-nums">{value}{suffix}</p>
    </div>
  );
}
