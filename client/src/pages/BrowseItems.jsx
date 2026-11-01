import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ItemCard from '../components/ItemCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { itemService, getErrorMessage } from '../services/api';

const emptyFilters = { itemType: '', category: '', location: '', date: '', status: '' };

export default function BrowseItems() {
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');   // what the user is typing
  const [q, setQ] = useState(searchParams.get('q') || '');                      // search sent to the API
  const [filters, setFilters] = useState({ ...emptyFilters, itemType: searchParams.get('type') || '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch whenever search, filters or page change (small delay so typing in "location" doesn't spam the API)
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const params = { q, page, limit: 12 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      itemService
        .list(params)
        .then((res) => { setData(res.data); setError(''); })
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [q, filters, page]);

  const handleFilter = (name, value) => { setFilters({ ...filters, [name]: value }); setPage(1); };
  const handleSearch = () => { setQ(searchText); setPage(1); };
  const reset = () => { setFilters(emptyFilters); setSearchText(''); setQ(''); setPage(1); };

  return (
    <div className="container section">
      <h1>Browse items</h1>
      <p className="muted">{data.total} listing{data.total === 1 ? '' : 's'} found</p>

      <SearchBar value={searchText} onChange={setSearchText} onSubmit={handleSearch} />
      <FilterPanel filters={filters} onChange={handleFilter} onReset={reset} />

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <Loader text="Looking for items..." />
      ) : data.items.length === 0 ? (
        <EmptyState title="No matching items" text="Try a different keyword or clear the filters." />
      ) : (
        <>
          <div className="card-grid">{data.items.map((item) => <ItemCard key={item._id} item={item} />)}</div>
          <Pagination page={data.page} pages={data.pages} onPage={setPage} />
        </>
      )}
    </div>
  );
}
