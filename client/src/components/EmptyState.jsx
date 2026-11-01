import { Link } from 'react-router-dom';

// Friendly message shown when a list has no results. Props: title, text, actionLabel, actionTo
export default function EmptyState({ title, text, actionLabel, actionTo }) {
  return (
    <div className="empty-state">
      <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="32" cy="32" r="18" fill="none" stroke="#9AA8C2" strokeWidth="5" />
        <line x1="45" y1="45" x2="60" y2="60" stroke="#FF9F43" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {actionLabel && (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
