import { useEffect, useState } from 'react';
import { claimService, getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import ClaimCard from '../components/ClaimCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const tabs = ['pending', 'approved', 'rejected', 'all'];

export default function AdminClaims() {
  const { showToast } = useToast();
  const [claims, setClaims] = useState([]);
  const [tab, setTab] = useState('pending');
  const [searchText, setSearchText] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});          // admin note typed for each claim id
  const [itemStatus, setItemStatus] = useState({}); // item status chosen for each claim id (after approval)
  const [busyId, setBusyId] = useState('');

  const load = () => {
    setLoading(true);
    claimService
      .all({ status: tab, q })
      .then((res) => setClaims(res.data.claims))
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line
  useEffect(load, [tab, q]);

  const review = async (claim, status) => {
    if (!window.confirm(`${status === 'approved' ? 'Approve' : 'Reject'} this claim?`)) return;
    setBusyId(claim._id);
    try {
      await claimService.setStatus(claim._id, {
        status,
        adminNote: notes[claim._id] || '',
        itemStatus: status === 'approved' ? itemStatus[claim._id] || 'claimed' : undefined,
      });
      showToast(`Claim ${status}`);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setBusyId('');
    }
  };

  return (
    <>
      <h1>Claim requests</h1>
      <SearchBar value={searchText} onChange={setSearchText} onSubmit={() => setQ(searchText)} placeholder="Search by item, student name, email or ID" />
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : claims.length === 0 ? (
        <EmptyState title="No claims found" text={tab === 'pending' ? 'All caught up. No claims are waiting for review.' : 'Nothing matches this filter.'} />
      ) : (
        <div className="stack">
          {claims.map((claim) => (
            <ClaimCard key={claim._id} claim={claim} admin>
              {claim.status === 'pending' && (
                <div className="review-box">
                  <div className="field">
                    <label htmlFor={`note-${claim._id}`}>Note for the student (optional)</label>
                    <input id={`note-${claim._id}`} maxLength={300} value={notes[claim._id] || ''} onChange={(e) => setNotes({ ...notes, [claim._id]: e.target.value })} placeholder="e.g. Collect from the security office" />
                  </div>
                  <div className="field">
                    <label htmlFor={`is-${claim._id}`}>Item status if approved</label>
                    <select id={`is-${claim._id}`} value={itemStatus[claim._id] || 'claimed'} onChange={(e) => setItemStatus({ ...itemStatus, [claim._id]: e.target.value })}>
                      <option value="claimed">Claimed (awaiting handover)</option>
                      <option value="resolved">Resolved (already handed over)</option>
                    </select>
                  </div>
                  <div className="btn-row">
                    <button className="btn btn-primary" disabled={busyId === claim._id} onClick={() => review(claim, 'approved')}>Approve</button>
                    <button className="btn btn-danger" disabled={busyId === claim._id} onClick={() => review(claim, 'rejected')}>Reject</button>
                  </div>
                </div>
              )}
            </ClaimCard>
          ))}
        </div>
      )}
    </>
  );
}
