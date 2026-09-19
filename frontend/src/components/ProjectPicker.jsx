import React from 'react';

export default function ProjectPicker({ projects, value, onChange }) {
  return (
    <select className="input max-w-xs" value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>Select a project…</option>
      {projects.map((p) => (
        <option key={p._id} value={p._id}>{p.name}</option>
      ))}
    </select>
  );
}
