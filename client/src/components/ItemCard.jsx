// Card shown in lists. Props: item (object from the API)
import { Link } from 'react-router-dom';
import { imageUrl, PLACEHOLDER_IMAGE } from '../services/api';
import { formatDate } from '../utils';
import StatusBadge from './StatusBadge';

export default function ItemCard({ item }) {
  return (
    <article className="item-card">
      <div className="item-card-img">
        <img
          src={imageUrl(item.image)}
          alt={item.image ? item.itemName : 'No photo available'}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
        />
        <span className={`type-tag type-${item.itemType}`}>{item.itemType}</span>
        {item.status !== 'active' && <span className="status-overlay"><StatusBadge value={item.status} /></span>}
      </div>
      <div className="item-card-body">
        <h3>{item.itemName}</h3>
        <p className="muted">{item.category}</p>
        <p className="meta">{item.location}</p>
        <p className="meta">{item.itemType === 'lost' ? 'Lost' : 'Found'} on {formatDate(item.date)}</p>
        <p className="meta small">Reported {formatDate(item.createdAt)}</p>
        <Link to={`/items/${item._id}`} className="btn btn-primary btn-block">View details</Link>
      </div>
    </article>
  );
}
