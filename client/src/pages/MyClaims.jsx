import { useEffect, useState } from 'react';
import { claimService, getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import ClaimCard from '../components/ClaimCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const tabs = ['all', 'pending', 'approved', 'rejected'];

export default function MyClaims() {
  const { showToast } = useToast();
  const [claims, setClaims] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    claimService
      .mine()
      .then((res) => setClaims(res.data.claims))
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  if (loading) return <Loader />;
  const shown = tab === 'all' ? claims : claims.filter((c) => c.status === tab);

  return (
    <>
      <h1>My claims</h1>
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t} {t === 'all' ? `(${claims.length})` : `(${claims.filter((c) => c.status === t).length})`}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState title="No claims here" text="Found your item in the listings? Open it and choose Claim this item." actionLabel="Browse found items" actionTo="/browse?type=found" />
      ) : (
        <div className="stack">{shown.map((c) => <ClaimCard key={c._id} claim={c} />)}</div>
      )}
    </>
  );
}
