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
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [searchText, setSearchText] = useState(q);
  const pageParam = Number(searchParams.get('page'));
  const page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const filters = Object.fromEntries(Object.keys(emptyFilters).map((name) => [
    name, searchParams.get(name === 'itemType' ? 'type' : name) || '',
  ]));
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => setSearchText(q), [q]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const timer = setTimeout(() => {
      const params = { q, page, limit: 12 };
      Object.keys(emptyFilters).forEach((name) => {
        const value = searchParams.get(name === 'itemType' ? 'type' : name);
        if (value) params[name] = value;
      });
      itemService
        .list(params)
        .then((res) => { if (active) setData(res.data); })
        .catch((err) => { if (active) setError(getErrorMessage(err)); })
        .finally(() => { if (active) setLoading(false); });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [q, page, searchParams]);

  const updateParam = (name, value, replace = false) => {
    const next = new URLSearchParams(searchParams);
    if (name !== 'page') next.delete('page');
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next, { replace });
  };
  const handleFilter = (name, value) => updateParam(name === 'itemType' ? 'type' : name, value, name === 'location');
  const handleSearch = () => updateParam('q', searchText.trim());
  const reset = () => { setSearchText(''); setSearchParams({}); };

  return (
    <div className="container section">
      <h1>Browse items</h1>
      <p className="muted">{data.total} listing{data.total === 1 ? '' : 's'} found</p>

      <SearchBar value={searchText} onChange={setSearchText} onSubmit={handleSearch} />
      <FilterPanel filters={filters} onChange={handleFilter} onReset={reset} />

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <Loader text="Looking for items..." />
      ) : error ? null : data.items.length === 0 ? (
        <EmptyState title="No matching items" text="Try a different keyword or clear the filters." />
      ) : (
        <>
          <div className="card-grid">{data.items.map((item) => <ItemCard key={item._id} item={item} />)}</div>
          <Pagination page={data.page} pages={data.pages} onPage={(nextPage) => updateParam('page', nextPage > 1 ? nextPage : '')} />
        </>
      )}
    </div>
  );
}
