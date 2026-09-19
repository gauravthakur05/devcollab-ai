import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-surface2 border border-border flex items-center justify-center mb-4 text-muted">
          <Icon size={22} />
        </div>
      )}
      <h3 className="text-ink font-semibold mb-1">{title}</h3>
      {description && <p className="text-muted text-sm max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
