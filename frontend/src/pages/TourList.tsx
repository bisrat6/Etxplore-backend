import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTours } from '../api/tours';

export default function TourList() {
  const [searchParams] = useSearchParams();
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  const params = useMemo(() => {
    const p: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      p[key] = value;
    });
    // defaults
    if (!p.limit) p.limit = '9';
    if (!p.page) p.page = '1';
    return p;
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getTours(params)
      .then((res) => {
        const list = res.data.data?.data ?? res.data.data?.tours ?? [];
        setTours(list);
        // try to infer total from response meta if present
        const metaTotal = res.data.results ?? res.data.total ?? res.data.data?.results ?? null;
        if (typeof metaTotal === 'number') setTotal(metaTotal);
      })
      .catch((err) => setError(err?.response?.data?.message ?? 'Failed to load tours'))
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) return <div>Loading tours...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  return (
    <div>
      <h2>Tours</h2>
      <Filters />
      <ul>
        {tours.map((t) => (
          <li key={t._id}>{t.name} — ${t.price}</li>
        ))}
      </ul>
      <Pagination total={total} />
    </div>
  );
}

function Filters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const difficulty = searchParams.get('difficulty') ?? '';
  const priceLte = searchParams.get('price[lte]') ?? '';
  const durationLte = searchParams.get('duration[lte]') ?? '';
  const ratingGte = searchParams.get('ratingsAverage[gte]') ?? '';
  const sort = searchParams.get('sort') ?? '';
  const limit = searchParams.get('limit') ?? '9';

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    // reset to page 1 when filters change
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div style={{ display: 'grid', gap: 8, margin: '12px 0' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select value={difficulty} onChange={(e) => update('difficulty', e.target.value)}>
          <option value="">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="difficult">Difficult</option>
        </select>
        <input
          type="number"
          placeholder="Max price"
          value={priceLte}
          onChange={(e) => update('price[lte]', e.target.value)}
        />
        <input
          type="number"
          placeholder="Max duration (days)"
          value={durationLte}
          onChange={(e) => update('duration[lte]', e.target.value)}
        />
        <input
          type="number"
          step="0.1"
          placeholder="Min rating"
          value={ratingGte}
          onChange={(e) => update('ratingsAverage[gte]', e.target.value)}
        />
        <select value={sort} onChange={(e) => update('sort', e.target.value)}>
          <option value="">Sort: default</option>
          <option value="-ratingsAverage,price">Best rated, then price</option>
          <option value="price">Price: low to high</option>
          <option value="-price">Price: high to low</option>
          <option value="-createdAt">Newest</option>
        </select>
        <select value={limit} onChange={(e) => update('limit', e.target.value)}>
          <option value="6">6 / page</option>
          <option value="9">9 / page</option>
          <option value="12">12 / page</option>
          <option value="24">24 / page</option>
        </select>
        <button onClick={() => setSearchParams(new URLSearchParams())}>Clear</button>
      </div>
    </div>
  );
}

function Pagination({ total }: { total: number | null }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '9');

  const nextPage = () => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page + 1));
    setSearchParams(next);
  };
  const prevPage = () => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(Math.max(1, page - 1)));
    setSearchParams(next);
  };

  // If total present, derive last page, else show simple next/prev
  let totalPages: number | null = null;
  if (typeof total === 'number' && total >= 0) {
    totalPages = Math.max(1, Math.ceil(total / limit));
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
      <button onClick={prevPage} disabled={page <= 1}>&lt; Prev</button>
      {totalPages ? (
        <span>
          Page {page} of {totalPages}
        </span>
      ) : (
        <span>Page {page}</span>
      )}
      <button onClick={nextPage} disabled={Boolean(totalPages && page >= totalPages)}>Next &gt;</button>
    </div>
  );
}



