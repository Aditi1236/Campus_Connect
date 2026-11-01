// Controlled search input. Props: value, onChange(text), onSubmit(), placeholder, large
export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search by item, place or category...', large = false }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit();
  };

  return (
    <form className={`searchbar ${large ? 'searchbar-lg' : ''}`} onSubmit={handleSubmit} role="search">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
      </svg>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label="Search items" />
      <button type="submit" className="btn btn-accent">Search</button>
    </form>
  );
}
