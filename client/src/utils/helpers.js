import { format, formatDistanceToNow, isPast, differenceInDays } from 'date-fns';

export const fmt = {
  date: (d) => (d ? format(new Date(d), 'MMM d, yyyy') : '—'),
  dateShort: (d) => (d ? format(new Date(d), 'MMM d') : '—'),
  dateTime: (d) => (d ? format(new Date(d), 'MMM d, yyyy · h:mm a') : '—'),
  relative: (d) => (d ? formatDistanceToNow(new Date(d), { addSuffix: true }) : '—'),
  daysLeft: (d) => {
    if (!d) return null;
    const days = differenceInDays(new Date(d), new Date());
    return days;
  },
};

export const isOverdue = (deadline, status) =>
  deadline && isPast(new Date(deadline)) && status !== 'Done';

export const getStatusColor = (status) => {
  const map = {
    Planning: 'var(--clr-info)',
    Active: 'var(--clr-primary)',
    Completed: 'var(--clr-success)',
    'On Hold': 'var(--clr-warning)',
  };
  return map[status] || 'var(--clr-text-3)';
};

export const getStatusBadgeClass = (status) => {
  const map = {
    Planning: 'badge-info',
    Active: 'badge-primary',
    Completed: 'badge-success',
    'On Hold': 'badge-warning',
  };
  return map[status] || 'badge-neutral';
};

export const getTaskStatusBadgeClass = (status) => {
  const map = {
    'To Do': 'badge-neutral',
    'In Progress': 'badge-primary',
    Done: 'badge-success',
  };
  return map[status] || 'badge-neutral';
};

export const getPriorityBadgeClass = (priority) => {
  const map = {
    Low: 'badge-neutral',
    Medium: 'badge-info',
    High: 'badge-warning',
    Critical: 'badge-danger',
  };
  return map[priority] || 'badge-neutral';
};

export const getHealthBadgeClass = (health) => {
  const map = {
    'On Track': 'badge-success',
    'At Risk': 'badge-warning',
    Delayed: 'badge-danger',
  };
  return map[health] || 'badge-neutral';
};

// Generate avatar color from string
export const getAvatarColor = (str) => {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#0ea5e9',
    '#06b6d4', '#14b8a6', '#22c55e', '#f59e0b',
    '#ef4444', '#f97316',
  ];
  let hash = 0;
  for (let i = 0; i < (str?.length || 0); i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
