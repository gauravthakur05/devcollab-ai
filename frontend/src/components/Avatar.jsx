import React from 'react';
import { initials } from '../utils/formatters';

export default function Avatar({ user, size = 32, ring = false }) {
  if (!user) {
    return <div className="rounded-full bg-surface2 border border-border" style={{ width: size, height: size }} />;
  }
  return (
    <div
      title={user.fullName}
      className={`rounded-full flex items-center justify-center font-semibold shrink-0 ${ring ? 'ring-2 ring-bg' : ''}`}
      style={{
        width: size,
        height: size,
        backgroundColor: user.avatarColor || '#6E56CF',
        fontSize: size * 0.4,
        color: 'white',
      }}
    >
      {initials(user.fullName || user.username || '?')}
    </div>
  );
}
