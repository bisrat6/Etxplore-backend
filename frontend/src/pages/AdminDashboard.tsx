import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTours } from '../api/tours';
import { getUsers } from '../api/users';
import { getReviews } from '../api/reviews';

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    const p: Record<string, any> = {};
    searchParams.forEach((value, key) => (p[key] = value));
    if (!p.limit) p.limit = '5';
    if (!p.page) p.page = '1';
    return p;
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getTours({ ...params, fields: 'name,price,ratingsAverage,ratingsQuantity' })
        .then((res) => res.data.data?.data ?? res.data.data?.tours ?? []),
      getUsers(params).then((res) => res.data.data?.data ?? res.data.data?.users ?? []),
      getReviews({ ...params, limit: 5, sort: '-rating' })
        .then((res) => res.data.data?.data ?? res.data.data?.reviews ?? [])
    ])
      .then(([t, u, r]) => {
        setTours(t);
        setUsers(u);
        setReviews(r);
      })
      .catch((e) => setError(e?.response?.data?.message ?? 'Failed to load admin data'))
      .finally(() => setLoading(false));
  }, [params]);

  const page = Number(params.page ?? '1');
  const limit = Number(params.limit ?? '5');

  const changePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(Math.max(1, nextPage)));
    next.set('limit', String(limit));
    setSearchParams(next);
  };

  if (loading) return <div>Loading admin dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Admin Dashboard</h2>
      <section>
        <h3>Overview</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Stat label="Tours" value={tours.length} />
          <Stat label="Users (page)" value={users.length} />
          <Stat label="Recent reviews" value={reviews.length} />
        </div>
      </section>

      <section>
        <h3>Tours</h3>
        <Table
          headers={['Name', 'Price', 'Rating', 'Qty']}
          rows={tours.map((t) => [t.name, `$${t.price}`, `${t.ratingsAverage}`, `${t.ratingsQuantity}`])}
        />
      </section>

      <section>
        <h3>Users</h3>
        <Table
          headers={['Name', 'Email', 'Role']}
          rows={users.map((u) => [u.name, u.email, u.role])}
        />
      </section>

      <section>
        <h3>Recent reviews</h3>
        <Table
          headers={['User', 'Rating', 'Review']}
          rows={reviews.map((r) => [r.user?.name ?? 'User', `${r.rating}`, r.review])}
        />
      </section>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => changePage(page - 1)} disabled={page <= 1}>&lt; Prev</button>
        <span>Page {page}</span>
        <button onClick={() => changePage(page + 1)}>Next &gt;</button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, minWidth: 140 }}>
      <div style={{ color: '#6b7280', fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ borderBottom: '1px solid #f3f4f6', padding: 8 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



