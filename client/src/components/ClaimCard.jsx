// Shows one claim request. Props: claim, admin (boolean), children (action buttons for admins)
import { Link } from 'react-router-dom';
import { imageUrl, PLACEHOLDER_IMAGE } from '../services/api';
import { formatDate } from '../utils';
import StatusBadge from './StatusBadge';

export default function ClaimCard({ claim, admin = false, children }) {
  const item = claim.item;
  return (
    <article className="claim-card">
      <img
        className="claim-thumb"
        src={imageUrl(item?.image)}
        alt=""
        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
      />
      <div className="claim-body">
        <div className="claim-head">
          <div>
            <h3>{item ? <Link to={`/items/${item._id}`}>{item.itemName}</Link> : 'Item removed'}</h3>
            <p className="muted small">
              {item?.category} - {item?.location}
              {item && <> - Item is <strong>{item.status}</strong></>}
            </p>
          </div>
          <StatusBadge value={claim.status} />
        </div>

        {admin && claim.claimant && (
          <p className="claimant">
            <strong>{claim.claimant.name}</strong> ({claim.claimant.studentId}) - {claim.claimant.email}
          </p>
        )}

        <dl className="claim-details">
          <dt>Explanation</dt>
          <dd>{claim.explanation}</dd>
          <dt>Identifying details</dt>
          <dd>{claim.identifyingDetails}</dd>
          {admin && item?.additionalDetails && (
            <>
              <dt>Finder's private notes</dt>
              <dd>{item.additionalDetails}</dd>
            </>
          )}
          {claim.adminNote && (
            <>
              <dt>Admin note</dt>
              <dd>{claim.adminNote}</dd>
            </>
          )}
        </dl>

        <p className="muted small">Submitted {formatDate(claim.createdAt)}{claim.reviewedBy?.name && ` - reviewed by ${claim.reviewedBy.name}`}</p>
        {children}
      </div>
    </article>
  );
}
