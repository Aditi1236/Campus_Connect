import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { itemService } from '../services/api';

const steps = [
  { title: 'Report', text: 'Post what you lost, or what you found, with a photo and where it happened.' },
  { title: 'Search', text: 'Browse listings or filter by category, place and date to spot a match.' },
  { title: 'Claim', text: 'Found your item? Describe it and give details only the owner would know.' },
  { title: 'Collect', text: 'An administrator verifies the claim and arranges the handover.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load the 6 most recent listings when the page opens
  useEffect(() => {
    itemService
      .list({ limit: 6 })
      .then((res) => setItems(res.data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const goSearch = () => navigate(`/browse?q=${encodeURIComponent(query)}`);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>Lost something on campus? Let's find it.</h1>
            <p>FindIt is the one place for students to report missing belongings, post things they have found, and get them back to the right person safely.</p>
            <SearchBar large value={query} onChange={setQuery} onSubmit={goSearch} placeholder="Try &quot;black wallet&quot; or &quot;library&quot;" />
            <div className="hero-actions">
              <Link to="/report-lost" className="btn btn-accent">Report lost item</Link>
              <Link to="/report-found" className="btn btn-light">Report found item</Link>
            </div>
          </div>
          <div className="hero-tag" aria-hidden="true">
            <div className="tag-hole" />
            <p className="tag-small">Found on campus</p>
            <p className="tag-big">Is this yours?</p>
            <p className="tag-small">Describe it to claim it.</p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Recently reported</h2>
          <Link to="/browse">See all items</Link>
        </div>
        {loading ? (
          <Loader />
        ) : items.length === 0 ? (
          <EmptyState title="No items reported yet" text="Be the first to post a lost or found item." actionLabel="Report an item" actionTo="/report-lost" />
        ) : (
          <div className="card-grid">{items.map((i) => <ItemCard key={i._id} item={i} />)}</div>
        )}
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="center">How it works</h2>
          <div className="steps">
            {steps.map((s, i) => (
              <div className="step" key={s.title}>
                <span className="step-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
