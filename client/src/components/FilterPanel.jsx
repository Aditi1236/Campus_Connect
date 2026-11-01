// Filter controls for the Browse page. Props: filters (object), onChange(name, value), onReset()
import { CATEGORIES, ITEM_STATUSES } from '../constants';

export default function FilterPanel({ filters, onChange, onReset, showClosed = false }) {
  const statuses = showClosed ? ITEM_STATUSES : ITEM_STATUSES.filter((s) => s !== 'closed');
  const set = (e) => onChange(e.target.name, e.target.value);

  return (
    <div className="filter-panel">
      <div className="field">
        <label htmlFor="f-type">Type</label>
        <select id="f-type" name="itemType" value={filters.itemType} onChange={set}>
          <option value="">Lost and found</option>
          <option value="lost">Lost items</option>
          <option value="found">Found items</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-cat">Category</label>
        <select id="f-cat" name="category" value={filters.category} onChange={set}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-loc">Location</label>
        <input id="f-loc" name="location" value={filters.location} onChange={set} placeholder="e.g. Library" />
      </div>
      <div className="field">
        <label htmlFor="f-date">Date</label>
        <input id="f-date" type="date" name="date" value={filters.date} onChange={set} />
      </div>
      <div className="field">
        <label htmlFor="f-status">Status</label>
        <select id="f-status" name="status" value={filters.status} onChange={set}>
          <option value="">Any status</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <button type="button" className="btn btn-ghost" onClick={onReset}>Clear filters</button>
    </div>
  );
}
