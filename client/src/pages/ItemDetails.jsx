import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { claimService, itemService, getErrorMessage, imageUrl, PLACEHOLDER_IMAGE } from '../services/api';
import { formatDate } from '../utils';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

export default function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null); // { item, isOwner, hasActiveClaim }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Claim form state
  const [showClaim, setShowClaim] = useState(false);
  const [claim, setClaim] = useState({ explanation: '', identifyingDetails: '' });
  const [claimError, setClaimError] = useState('');
  const [sending, setSending] = useState(false);

  const load = () =>
    itemService
      .get(id)
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));

  useEffect(() => { setLoading(true); load(); /* eslint-disable-next-line */ }, [id]);

  const submitClaim = async (e) => {
    e.preventDefault();
    setClaimError('');
    if (claim.explanation.trim().length < 20) return setClaimError('Please explain in at least 20 characters why this item is yours.');
    if (!claim.identifyingDetails.trim()) return setClaimError('Please add identifying details.');

    setSending(true);
    try {
      await claimService.create({ item: id, ...claim });
      showToast('Claim submitted. We will review it soon.');
      setShowClaim(false);
      navigate('/my-claims');
    } catch (err) {
      setClaimError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="container section"><div className="alert alert-error">{error}</div><Link to="/browse">Back to browse</Link></div>;

  const { item, isOwner, hasActiveClaim } = data;
  const canClaim = item.itemType === 'found' && item.status === 'active' && !isOwner && user?.role !== 'admin' && !hasActiveClaim;

  return (
    <div className="container section details">
      <Link to="/browse" className="back-link">Back to all items</Link>
      <div className="details-grid">
        <img
          className="details-img"
          src={imageUrl(item.image)}
          alt={item.image ? item.itemName : 'No photo available'}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
        />

        <div className="details-info">
          <div className="badge-row">
            <span className={`type-tag static type-${item.itemType}`}>{item.itemType}</span>
            <StatusBadge value={item.status} />
          </div>
          <h1>{item.itemName}</h1>
          <p className="details-desc">{item.description}</p>

          <dl className="info-list">
            <dt>Category</dt><dd>{item.category}</dd>
            <dt>{item.itemType === 'lost' ? 'Last seen at' : 'Found at'}</dt><dd>{item.location}</dd>
            <dt>{item.itemType === 'lost' ? 'Date lost' : 'Date found'}</dt><dd>{formatDate(item.date)}</dd>
            <dt>Reported by</dt><dd>{item.reportedBy?.name || 'A student'}</dd>
            <dt>Reported on</dt><dd>{formatDate(item.createdAt)}</dd>
          </dl>

          {/* Only the owner and admins receive additionalDetails from the API */}
          {item.additionalDetails && (
            <div className="private-box">
              <strong>Private identifying details</strong>
              <p>{item.additionalDetails}</p>
              <small>Only you and administrators can see this.</small>
            </div>
          )}

          <div className="details-actions">
            {isOwner && ['active', 'closed'].includes(item.status) && (
              <Link to={`/items/${item._id}/edit`} className="btn btn-outline">Edit listing</Link>
            )}
            {canClaim && user && <button className="btn btn-accent" onClick={() => setShowClaim(true)}>Claim this item</button>}
            {canClaim && !user && <Link to="/login" state={{ from: `/items/${item._id}` }} className="btn btn-accent">Log in to claim</Link>}
            {hasActiveClaim && <Link to="/my-claims" className="btn btn-outline">You have claimed this - track it</Link>}
            {item.itemType === 'lost' && !isOwner && item.status === 'active' && (
              <Link to="/report-found" className="btn btn-outline">I found this - report it</Link>
            )}
          </div>
          {item.itemType === 'found' && item.status !== 'active' && <p className="muted">This item is no longer open for claims.</p>}
        </div>
      </div>

      {showClaim && (
        <div className="modal-backdrop" onClick={() => setShowClaim(false)}>
          <form className="modal form-card" onClick={(e) => e.stopPropagation()} onSubmit={submitClaim} noValidate>
            <h2>Claim "{item.itemName}"</h2>
            <p className="muted">An administrator compares your answers with the finder's notes. Be specific.</p>
            {claimError && <div className="alert alert-error" role="alert">{claimError}</div>}
            <div className="field">
              <label htmlFor="explanation">Why is this yours?</label>
              <textarea id="explanation" rows="4" value={claim.explanation} maxLength={1000} onChange={(e) => setClaim({ ...claim, explanation: e.target.value })} placeholder="Where and when you lost it, how you use it..." />
            </div>
            <div className="field">
              <label htmlFor="identifying">Identifying details</label>
              <textarea id="identifying" rows="3" value={claim.identifyingDetails} maxLength={500} onChange={(e) => setClaim({ ...claim, identifyingDetails: e.target.value })} placeholder="Marks, contents, serial number, lock-screen..." />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowClaim(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={sending}>{sending ? 'Sending...' : 'Submit claim'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
