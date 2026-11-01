import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, getErrorMessage } from '../services/api';
import { formatDate } from '../utils';
import DashboardStats from '../components/DashboardStats';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService
      .dashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <Loader />;

  const { stats, topCategories, recentItems, recentClaims } = data;
  const maxCat = Math.max(1, ...topCategories.map((c) => c.count));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Admin overview</h1>
          <p className="muted">Live numbers from the database.</p>
        </div>
        <Link to="/admin/claims" className="btn btn-accent">
          Review claims {stats.pendingClaims > 0 && `(${stats.pendingClaims})`}
        </Link>
      </div>

      <DashboardStats
        stats={[
          { label: 'Registered students', value: stats.totalStudents, tone: 'navy' },
          { label: 'Lost items', value: stats.totalLost, tone: 'orange' },
          { label: 'Found items', value: stats.totalFound, tone: 'sky' },
          { label: 'Pending claims', value: stats.pendingClaims, tone: 'red' },
          { label: 'Resolved items', value: stats.resolvedItems, tone: 'green' },
        ]}
      />

      <div className="two-col">
        <section className="panel">
          <h2>Recent listings</h2>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Item</th><th>Type</th><th>By</th><th>Status</th></tr></thead>
              <tbody>
                {recentItems.map((i) => (
                  <tr key={i._id}>
                    <td data-label="Item"><Link to={`/items/${i._id}`}>{i.itemName}</Link><small>{formatDate(i.createdAt)}</small></td>
                    <td data-label="Type"><span className={`type-tag static type-${i.itemType}`}>{i.itemType}</span></td>
                    <td data-label="By">{i.reportedBy?.name || 'Deleted user'}</td>
                    <td data-label="Status"><StatusBadge value={i.status} /></td>
                  </tr>
                ))}
                {recentItems.length === 0 && <tr><td colSpan="4" className="muted">No listings yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <Link to="/admin/items">Manage all listings</Link>
        </section>

        <section className="panel">
          <h2>Recent claims</h2>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Item</th><th>Claimant</th><th>Status</th></tr></thead>
              <tbody>
                {recentClaims.map((c) => (
                  <tr key={c._id}>
                    <td data-label="Item">{c.item?.itemName || 'Removed item'}<small>{formatDate(c.createdAt)}</small></td>
                    <td data-label="Claimant">{c.claimant?.name || 'Deleted user'}</td>
                    <td data-label="Status"><StatusBadge value={c.status} /></td>
                  </tr>
                ))}
                {recentClaims.length === 0 && <tr><td colSpan="3" className="muted">No claims yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <Link to="/admin/claims">Manage claims</Link>
        </section>
      </div>

      <section className="panel">
        <h2>Most reported categories</h2>
        {topCategories.length === 0 ? (
          <p className="muted">Categories will appear once items are reported.</p>
        ) : (
          <ul className="bars">
            {topCategories.map((c) => (
              <li key={c.category}>
                <span>{c.category}</span>
                <div className="bar"><div style={{ width: `${(c.count / maxCat) * 100}%` }} /></div>
                <strong>{c.count}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
