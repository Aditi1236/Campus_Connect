import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ITEM_STATUSES } from '../constants';
import { formatDate } from '../utils';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const emptyFilters = { itemType: '', category: '', location: '', date: '', status: '' };

export default function AdminItems() {
  const { showToast } = useToast();
  const [data, setData] = useState({ items: [], total: 0, pages: 1, page: 1 });
  const [filters, setFilters] = useState(emptyFilters);
  const [searchText, setSearchText] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = { q, page, limit: 15 };
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    adminService
      .items(params)
      .then((res) => setData(res.data))
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [q, filters, page]);

  const changeStatus = async (item, status) => {
    try {
      await adminService.setItemStatus(item._id, status);
      setData((d) => ({ ...d, items: d.items.map((i) => (i._id === item._id ? { ...i, status } : i)) }));
      showToast('Status updated');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Remove "${item.itemName}" and its claims permanently?`)) return;
    try {
      await adminService.deleteItem(item._id);
      showToast('Listing removed');
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <>
      <h1>All listings</h1>
      <p className="muted">{data.total} listing{data.total === 1 ? '' : 's'}</p>
      <SearchBar value={searchText} onChange={setSearchText} onSubmit={() => { setQ(searchText); setPage(1); }} />
      <FilterPanel
        showClosed
        filters={filters}
        onChange={(n, v) => { setFilters({ ...filters, [n]: v }); setPage(1); }}
        onReset={() => { setFilters(emptyFilters); setSearchText(''); setQ(''); setPage(1); }}
      />

      {loading ? (
        <Loader />
      ) : data.items.length === 0 ? (
        <EmptyState title="No listings match" text="Change or clear the filters." />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Item</th><th>Type</th><th>Reported by</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item._id}>
                    <td data-label="Item"><Link to={`/items/${item._id}`}><strong>{item.itemName}</strong></Link><small>{item.category} - {item.location}</small></td>
                    <td data-label="Type"><span className={`type-tag static type-${item.itemType}`}>{item.itemType}</span></td>
                    <td data-label="By">{item.reportedBy ? <>{item.reportedBy.name}<small>{item.reportedBy.studentId}</small></> : 'Deleted user'}</td>
                    <td data-label="Date">{formatDate(item.date)}</td>
                    <td data-label="Status">
                      <select className="select-sm" aria-label={`Status of ${item.itemName}`} value={item.status} onChange={(e) => changeStatus(item, e.target.value)}>
                        {ITEM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td data-label="Actions"><button className="btn btn-danger btn-sm" onClick={() => remove(item)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} onPage={setPage} />
        </>
      )}
    </>
  );
}
