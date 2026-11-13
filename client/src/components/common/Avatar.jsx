import { getAvatarColor, getInitials } from '../../utils/helpers';

export default function Avatar({ name, size = 'md', style = {} }) {
  const sizeClass = { sm: 'avatar-sm', md: '', lg: 'avatar-lg', xl: 'avatar-xl' }[size] || '';
  const bg = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={`avatar ${sizeClass}`}
      style={{ background: `linear-gradient(135deg, ${bg}, ${bg}bb)`, ...style }}
      title={name}
    >
      {initials}
    </div>
  );
}

export function AvatarStack({ members = [], max = 3 }) {
  const shown = members.slice(0, max);
  const extra = members.length - max;

  return (
    <div className="avatar-stack">
      {shown.map((m, i) => (
        <Avatar key={m._id || i} name={m.name} size="sm" />
      ))}
      {extra > 0 && (
        <div
          className="avatar avatar-sm"
          style={{ background: 'var(--clr-surface-3)', color: 'var(--clr-text-2)' }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
