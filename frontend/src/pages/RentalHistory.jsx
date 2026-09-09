import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import VehicleImage from '../components/VehicleImage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Section = ({ title, bookings }) => (
  <div className="mb-4">
    <h5 className="mb-3">{title}</h5>
    {bookings.length === 0 && <p className="text-muted">None</p>}
    {bookings.length > 0 && (
      <div className="row g-3">
        {bookings.map((b) => (
          <div className="col-md-6 col-lg-4" key={b._id}>
            <div className="card p-3 d-flex flex-row gap-3">
              <div className="rounded-xl overflow-hidden" style={{ width: 90, height: 68, flexShrink: 0 }}>
                <VehicleImage
                  vehicle={b.vehicleId}
                  width={250}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <strong className="small">
                  {b.vehicleId?.brand} {b.vehicleId?.model}
                </strong>
                <div className="text-muted small">
                  {new Date(b.startDate).toLocaleDateString()} &rarr;{' '}
                  {new Date(b.endDate).toLocaleDateString()}
                </div>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="fw-bold small">₹{b.totalAmount}</span>
                  <span className={`badge badge-${b.status}`}>{b.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const RentalHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    bookingService
      .getCustomerBookings(user._id)
      .then((res) => setHistory(res.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="container section-sm">
      <h2 className="section-title">Rental history</h2>
      <ErrorMessage error={error} />
      {history && (
        <>
          <Section title="Active (reserved / picked up)" bookings={history.active} />
          <Section title="Returned" bookings={history.returned} />
          <Section title="Cancelled" bookings={history.cancelled} />
        </>
      )}
    </div>
  );
};

export default RentalHistory;
