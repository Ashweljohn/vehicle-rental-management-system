import React, { useEffect, useState } from 'react';
import bookingService from '../services/bookingService';
import VehicleImage from '../components/VehicleImage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const canCancel = (status) => status === 'RESERVED';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const load = () => {
    setLoading(true);
    bookingService
      .getBookings()
      .then((res) => setBookings(res.data))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? A cancellation charge may apply depending on timing.')) {
      return;
    }
    setCancellingId(id);
    setError(null);
    try {
      const res = await bookingService.cancelBooking(id);
      alert(
        `Booking cancelled. Charge: ₹${res.data.cancellationCharge} (${res.data.chargePercentage}%). Refund: ₹${res.data.refundAmount}`
      );
      load();
    } catch (err) {
      setError(err);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container section-sm">
      <h2 className="section-title">My bookings</h2>
      <ErrorMessage error={error} />

      {bookings.length === 0 && (
        <div className="card p-5 text-center">
          <p className="text-muted mb-0">You have no bookings yet.</p>
        </div>
      )}

      <div className="row g-3">
        {bookings.map((b) => (
          <div className="col-md-6 col-lg-4" key={b._id}>
            <div className="card p-3 h-100 d-flex flex-column">
              <div className="d-flex gap-3 mb-3">
                <div className="rounded-xl overflow-hidden" style={{ width: 100, height: 75, flexShrink: 0 }}>
                  <VehicleImage
                    vehicle={b.vehicleId}
                    width={300}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <strong>
                    {b.vehicleId?.brand} {b.vehicleId?.model}
                  </strong>
                  <div className="text-muted small">{b.vehicleId?.registrationNumber}</div>
                  <div className="text-muted small">Booking ID: {b._id.slice(-8)}</div>
                </div>
              </div>

              <div className="text-muted small mb-1">
                {new Date(b.startDate).toLocaleDateString()} &rarr;{' '}
                {new Date(b.endDate).toLocaleDateString()} ({b.numberOfDays} day
                {b.numberOfDays > 1 ? 's' : ''})
              </div>
              <div className="fw-bold mb-2">₹{b.totalAmount}</div>

              <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                <span className={`badge badge-${b.status}`}>{b.status}</span>
                {canCancel(b.status) && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    disabled={cancellingId === b._id}
                    onClick={() => handleCancel(b._id)}
                  >
                    {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
