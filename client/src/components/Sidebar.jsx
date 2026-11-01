// Side navigation for dashboards. Shows different links for students and administrators.
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/report-lost', label: 'Report lost item' },
  { to: '/report-found', label: 'Report found item' },
  { to: '/my-listings', label: 'My listings' },
  { to: '/my-claims', label: 'My claims' },
  { to: '/browse', label: 'Browse all items' },
  { to: '/profile', label: 'Profile' },
];

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/claims', label: 'Claim requests' },
  { to: '/admin/items', label: 'All listings' },
  { to: '/admin/users', label: 'Students' },
  { to: '/browse', label: 'Public site' },
  { to: '/profile', label: 'Profile' },
];

export default function Sidebar({ open, onClose }) {
  const { user, isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-user">
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{user?.name}</strong>
            <small>{isAdmin ? 'Administrator' : user?.studentId}</small>
          </div>
        </div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={onClose}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
    </>
  );
}
