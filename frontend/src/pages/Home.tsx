import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTours } from '../api/tours';
import TourCard from '../components/TourCard';

export default function Home() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTours({ limit: 6, sort: '-ratingsAverage,price' })
      .then((res) => setTours(res.data.data?.data ?? res.data.data?.tours ?? []))
      .catch((err) => setError(err?.response?.data?.message ?? 'Failed to load featured tours'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section style={{ padding: 24, background: '#f8fafc', borderRadius: 12 }}>
        <h1 style={{ marginTop: 0 }}>Find your next adventure</h1>
        <p>Browse our most loved tours and start planning today.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/tours">Browse all tours</Link>
          <Link to="/signup">Create an account</Link>
        </div>
      </section>

      <section>
        <h2>Featured tours</h2>
        {loading && <div>Loading featured tours...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {tours.map((t) => (
              <TourCard key={t._id} tour={t} />)
            )}
          </div>
        )}
      </section>

      <section>
        <h2>Quick filters</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link to="/tours?difficulty=easy">Easy</Link>
          <Link to="/tours?difficulty=medium">Medium</Link>
          <Link to="/tours?difficulty=difficult">Difficult</Link>
          <Link to="/tours?price[lte]=500">Under $500</Link>
          <Link to="/tours?price[lte]=1000">Under $1000</Link>
          <Link to="/tours?duration[lte]=5">Up to 5 days</Link>
          <Link to="/tours?ratingsAverage[gte]=4.5">Top rated (4.5+)</Link>
          <Link to="/tours?sort=-ratingsAverage,price">Sort: Best rated, then price</Link>
        </div>
      </section>
    </div>
  );
}



