import { Link } from 'react-router-dom';

type Props = {
  tour: any;
};

export default function TourCard({ tour }: Props) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>{tour.name}</h3>
      <div>Price: ${'{'}tour.price{'}'}</div>
      <div>Rating: {tour.ratingsAverage} ({tour.ratingsQuantity})</div>
      <div>Duration: {tour.duration} days</div>
      <Link to={`/tours/${tour._id}`}>View details</Link>
    </div>
  );
}


