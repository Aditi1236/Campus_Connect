import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Logo light />
          <p>Lost something on campus? Found something that isn't yours? FindIt connects the two.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/browse">Browse items</Link>
          <Link to="/report-lost">Report lost item</Link>
          <Link to="/report-found">Report found item</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Log in</Link>
          <Link to="/register">Create account</Link>
          <Link to="/my-claims">My claims</Link>
        </div>
      </div>
      <div className="footer-bottom">FindIt - Smart Campus Lost &amp; Found Portal. Full Stack Development II mini-project.</div>
    </footer>
  );
}
