import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar({ onMenuClick }) {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false); // mobile menu
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* The sidebar toggle only appears on dashboard pages (mobile) */}
        {onMenuClick && (
          <button className="icon-btn sidebar-toggle" onClick={onMenuClick} aria-label="Open menu">
            <span /><span /><span />
          </button>
        )}
        <Logo />

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/browse" onClick={close}>Browse items</NavLink>
          {user ? (
            <>
              <NavLink to={isAdmin ? '/admin' : '/dashboard'} onClick={close}>Dashboard</NavLink>
              {!isAdmin && <NavLink to="/report-lost" onClick={close}>Report lost</NavLink>}
              {!isAdmin && <NavLink to="/report-found" onClick={close}>Report found</NavLink>}
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Log in</NavLink>
              <NavLink to="/register" className="btn btn-accent btn-sm" onClick={close}>Sign up</NavLink>
            </>
          )}
        </nav>

        <button className="icon-btn nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
