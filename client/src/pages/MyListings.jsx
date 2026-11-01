import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { itemService, getErrorMessage, imageUrl, PLACEHOLDER_IMAGE } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function MyListings() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemService
      .mine()
      .then((res) => setItems(res.data.items))
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.itemName}"? This cannot be undone.`)) return;
    try {
      await itemService.remove(item._id);
      setItems((list) => list.filter((i) => i._id !== item._id));
      showToast('Listing deleted');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="page-head">
        <h1>My listings</h1>
        <div className="btn-row">
          <Link to="/report-lost" className="btn btn-outline btn-sm">Report lost</Link>
          <Link to="/report-found" className="btn btn-primary btn-sm">Report found</Link>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="You haven't reported anything yet" text="Lost or found something? Post it here." actionLabel="Report an item" actionTo="/report-lost" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Item</th><th>Type</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const editable = ['active', 'closed'].includes(item.status); // claimed/resolved items are locked
                return (
                  <tr key={item._id}>
                    <td data-label="Item">
                      <div className="cell-item">
                        <img src={imageUrl(item.image)} alt="" onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }} />
                        <div>
                          <Link to={`/items/${item._id}`}><strong>{item.itemName}</strong></Link>
                          <small>{item.category}</small>
                        </div>
                      </div>
                    </td>
                    <td data-label="Type"><span className={`type-tag static type-${item.itemType}`}>{item.itemType}</span></td>
                    <td data-label="Date">{formatDate(item.date)}</td>
                    <td data-label="Status"><StatusBadge value={item.status} /></td>
                    <td data-label="Actions">
                      <div className="btn-row">
                        {editable ? (
                          <>
                            <Link to={`/items/${item._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item)}>Delete</button>
                          </>
                        ) : (
                          <small className="muted">Locked</small>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
