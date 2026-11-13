export function Spinner({ size = 40, text = 'Loading…' }) {
  return (
    <div className="loading-spinner" style={{ flexDirection: 'column', gap: 16 }}>
      <div
        className="spinner"
        style={{ width: size, height: size, borderWidth: Math.max(2, size / 14) }}
      />
      {text && <p style={{ color: 'var(--clr-text-3)', fontSize: '0.875rem' }}>{text}</p>}
    </div>
  );
}

export function EmptyState({ icon = '📭', title = 'Nothing here yet', description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
