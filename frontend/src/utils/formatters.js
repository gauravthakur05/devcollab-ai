export function initials(fullName = '') {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
}

export function timeAgo(dateInput) {
  const date = new Date(dateInput);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const ranges = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, secondsInUnit] of ranges) {
    const value = Math.floor(seconds / secondsInUnit);
    if (value >= 1) return `${value}${unit[0]}${value > 1 ? '' : ''} ago`;
  }
  return 'just now';
}

export function formatDate(dateInput) {
  if (!dateInput) return '—';
  return new Date(dateInput).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateInput) {
  if (!dateInput) return '—';
  return new Date(dateInput).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const STATUS_LABELS = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  CODE_REVIEW: 'Code Review',
  TESTING: 'Testing',
  DONE: 'Done',
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  PLANNED: 'Planned',
};

export const PRIORITY_COLORS = {
  LOW: 'bg-[#1E2330] text-muted border-border',
  MEDIUM: 'bg-info/10 text-info border-info/30',
  HIGH: 'bg-warn/10 text-warn border-warn/30',
  CRITICAL: 'bg-danger/10 text-danger border-danger/30',
};
