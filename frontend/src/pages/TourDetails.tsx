import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTour } from '../api/tours';
import { createReview, deleteReview, getReviewsByTour, updateReview } from '../api/reviews';
import { useAuth } from '../providers/AuthProvider';

export default function TourDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tour, setTour] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<{ rating: number; review: string; _id?: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getTour(id).then((res) => res.data.data?.data ?? res.data.data?.tour ?? res.data.data ?? null),
      getReviewsByTour(id).then((res) => res.data.data?.data ?? res.data.data?.reviews ?? res.data.data ?? res.data ?? [])
    ])
      .then(([tourData, reviewData]) => {
        setTour(tourData);
        setReviews(Array.isArray(reviewData) ? reviewData : reviewData.data ?? []);
      })
      .catch((err) => setError(err?.response?.data?.message ?? 'Failed to load tour'))
      .finally(() => setLoading(false));
  }, [id]);

  const imageCoverUrl = useMemo(() => (tour?.imageCover ? `/img/tours/${tour.imageCover}` : null), [tour]);

  if (loading) return <div>Loading tour...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!tour) return null;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ display: 'grid', gap: 8 }}>
        <h2 style={{ margin: 0 }}>{tour.name}</h2>
        <div>
          <strong>${'{'}tour.price{'}'}</strong> · {tour.duration} days · {tour.difficulty}
        </div>
        <div>
          Rating {tour.ratingsAverage} ({tour.ratingsQuantity}) · Group size {tour.maxGroupSize}
        </div>
        {imageCoverUrl && (
          <img src={imageCoverUrl} alt={tour.name} style={{ maxWidth: '100%', borderRadius: 8 }} />
        )}
      </header>

      {tour.summary && (
        <section>
          <h3>Summary</h3>
          <p>{tour.summary}</p>
        </section>
      )}

      {tour.description && (
        <section>
          <h3>Description</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{tour.description}</p>
        </section>
      )}

      {Array.isArray(tour.images) && tour.images.length > 0 && (
        <section>
          <h3>Gallery</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {tour.images.map((img: string) => (
              <img key={img} src={`/img/tours/${img}`} alt={tour.name} style={{ width: '100%', borderRadius: 8 }} />
            ))}
          </div>
        </section>
      )}

      {Array.isArray(tour.startDates) && tour.startDates.length > 0 && (
        <section>
          <h3>Start dates</h3>
          <ul>
            {tour.startDates.map((d: string) => (
              <li key={d}>{new Date(d).toLocaleDateString()}</li>
            ))}
          </ul>
        </section>
      )}

      {tour.startLocation && (
        <section>
          <h3>Start location</h3>
          <div>
            {tour.startLocation.description || tour.startLocation.address}
            {Array.isArray(tour.startLocation.coordinates) && (
              <span>
                {' '}({tour.startLocation.coordinates[1]}, {tour.startLocation.coordinates[0]})
              </span>
            )}
          </div>
        </section>
      )}

      {Array.isArray(tour.locations) && tour.locations.length > 0 && (
        <section>
          <h3>Itinerary</h3>
          <ol>
            {tour.locations.map((loc: any, idx: number) => (
              <li key={idx}>
                Day {loc.day}: {loc.description || loc.address}
                {Array.isArray(loc.coordinates) && (
                  <span>
                    {' '}({loc.coordinates[1]}, {loc.coordinates[0]})
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {Array.isArray(tour.guides) && tour.guides.length > 0 && (
        <section>
          <h3>Guides</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {tour.guides.map((g: any) => (
              <div key={g._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, minWidth: 180 }}>
                {g.photo && (
                  <img src={`/img/users/${g.photo}`} alt={g.name} style={{ width: 64, height: 64, borderRadius: '50%' }} />
                )}
                <div>{g.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{g.role}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3>Reviews</h3>
        {user && (
          <ReviewForm
            tourId={tour._id}
            form={form}
            setForm={setForm}
            submitting={submitting}
            formError={formError}
            onSubmit={async (payload) => {
              setSubmitting(true);
              setFormError(null);
              try {
                if (payload._id) {
                  await updateReview(payload._id, { rating: payload.rating, review: payload.review });
                } else {
                  await createReview({ tour: tour._id, rating: payload.rating, review: payload.review });
                }
                const refreshed = await getReviewsByTour(tour._id);
                const reviewData = refreshed.data.data?.data ?? refreshed.data.data?.reviews ?? refreshed.data.data ?? refreshed.data ?? [];
                setReviews(Array.isArray(reviewData) ? reviewData : reviewData.data ?? []);
                setForm(null);
              } catch (e: any) {
                setFormError(e?.response?.data?.message ?? 'Failed to submit review');
              } finally {
                setSubmitting(false);
              }
            }}
          />
        )}
        {reviews.length === 0 ? (
          <div>No reviews yet.</div>
        ) : (
          <ul style={{ display: 'grid', gap: 8, paddingLeft: 16 }}>
            {reviews.map((r: any) => (
              <li key={r._id} style={{ listStyle: 'disc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {r.user?.photo && (
                    <img src={`/img/users/${r.user.photo}`} alt={r.user?.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  )}
                  <strong>{r.user?.name ?? 'User'}</strong>
                  <span style={{ color: '#6b7280' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div>Rating: {r.rating}</div>
                <div>{r.review}</div>
                {user && (r.user?._id === (user as any)?._id || r.user?._id === (user as any)?.id) && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      onClick={() => setForm({ _id: r._id, rating: r.rating, review: r.review })}
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await deleteReview(r._id);
                          setReviews((prev) => prev.filter((x) => x._id !== r._id));
                        } catch (e) {
                          // no-op; could add error toast
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ReviewForm({
  tourId,
  form,
  setForm,
  submitting,
  formError,
  onSubmit
}: {
  tourId: string;
  form: { rating: number; review: string; _id?: string } | null;
  setForm: (f: { rating: number; review: string; _id?: string } | null) => void;
  submitting: boolean;
  formError: string | null;
  onSubmit: (payload: { rating: number; review: string; _id?: string }) => Promise<void>;
}) {
  const [rating, setRating] = useState<number>(form?.rating ?? 5);
  const [review, setReview] = useState<string>(form?.review ?? '');

  useEffect(() => {
    setRating(form?.rating ?? 5);
    setReview(form?.review ?? '');
  }, [form]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit({ _id: form?._id, rating, review });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, margin: '8px 0' }}>
      <h4 style={{ margin: 0 }}>{form?._id ? 'Edit your review' : 'Write a review'}</h4>
      {formError && <div style={{ color: 'red' }}>{formError}</div>}
      <label>
        Rating
        <input
          type="number"
          min={1}
          max={5}
          step={1}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={{ marginLeft: 8 }}
        />
      </label>
      <textarea
        placeholder="Your thoughts about this tour"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={3}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button disabled={submitting}>{submitting ? 'Submitting...' : form?._id ? 'Update review' : 'Post review'}</button>
        {form?._id && (
          <button type="button" onClick={() => setForm(null)}>Cancel</button>
        )}
      </div>
    </form>
  );
}



