import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemService, claimService } from '../services/api';
import DashboardStats from '../components/DashboardStats';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function StudentDashboard() {
  const { user, isAdmin } = useAuth();
  const [mine, setMine] = useState([]);
  const [claims, setClaims] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load everything the dashboard needs at the same time
  useEffect(() => {
    if (isAdmin) return;
    Promise.all([itemService.mine(), claimService.mine(), itemService.list({ limit: 4 })])
      .then(([m, c, r]) => {
        setMine(m.data.items);
        setClaims(c.data.claims);
        setRecent(r.data.items);
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (isAdmin) return <Navigate to="/admin" replace />;
  if (loading) return <Loader />;

  const stats = [
    { label: 'Items I reported', value: mine.length, tone: 'navy' },
    { label: 'Items I found', value: mine.filter((i) => i.itemType === 'found').length, tone: 'sky' },
    { label: 'My active listings', value: mine.filter((i) => i.status === 'active').length, tone: 'orange' },
    { label: 'My claim requests', value: claims.length, tone: 'green' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Welcome, {user.name.split(' ')[0]}</h1>
          <p className="muted">Here's what is happening with your reports.</p>
        </div>
        <div className="btn-row">
          <Link to="/report-lost" className="btn btn-outline">Report lost</Link>
          <Link to="/report-found" className="btn btn-accent">Report found</Link>
        </div>
      </div>

      <DashboardStats stats={stats} />

      <div className="section-head"><h2>Recently reported on campus</h2><Link to="/browse">View all</Link></div>
      {recent.length === 0 ? (
        <EmptyState title="Nothing reported yet" text="New lost and found items will show up here." />
      ) : (
        <div className="card-grid">{recent.map((i) => <ItemCard key={i._id} item={i} />)}</div>
      )}
    </>
  );
}
