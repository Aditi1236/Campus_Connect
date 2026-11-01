import { Link } from 'react-router-dom';

// Logo mark: a magnifying glass inside a rounded square
export default function Logo({ light = false }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo-light' : ''}`} aria-label="FindIt home">
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill={light ? '#38BDF8' : '#0B1F44'} />
        <circle cx="28" cy="28" r="12" fill="none" stroke={light ? '#0B1F44' : '#38BDF8'} strokeWidth="5" />
        <line x1="37" y1="37" x2="50" y2="50" stroke="#FF9F43" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <span>FindIt</span>
    </Link>
  );
}
