import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingService from '../services/bookingService';
import VehicleImage from '../components/VehicleImage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const ReturnInspection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [form, setForm] = useState({
    odometer: '',
    fuelLevel: '',
    damageNotes: '',
    extraCharges: '0',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    bookingService
      .getBookingById(id)
      .then((res) => setBooking(res.data))
      .catch(setError)
      .finally(() => setLoadingBooking(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const extraCharges = Number(form.extraCharges) || 0;
  const baseRental = booking?.totalAmount || 0;
  const totalAdditional = extraCharges;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await bookingService.returnInspection(id, {
        odometer: Number(form.odometer),
        fuelLevel: Number(form.fuelLevel),
        damageNotes: form.damageNotes,
        extraCharges,
      });
      navigate('/staff/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBooking) return <Loading />;

  return (
    <div className="container section-sm" style={{ maxWidth: 640 }}>
      <h2 className="section-title">Return inspection</h2>
      <ErrorMessage error={error} />

      {booking && (
        <div className="card p-3 mb-4">
          <div className="rounded-xl overflow-hidden mb-3" style={{ height: 160 }}>
            <VehicleImage
              vehicle={booking.vehicleId}
              width={700}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="row g-2 small">
            <div className="col-6">
              <span className="text-muted">Vehicle:</span> {booking.vehicleId?.brand}{' '}
              {booking.vehicleId?.model}
            </div>
            <div className="col-6">
              <span className="text-muted">Customer:</span> {booking.customerId?.name}
            </div>
            <div className="col-6">
              <span className="text-muted">Booking ID:</span> {booking._id.slice(-8)}
            </div>
            <div className="col-6">
              <span className="text-muted">Due date:</span>{' '}
              {new Date(booking.endDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      <form className="card p-4" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Return odometer reading (km)</label>
          <input
            type="number"
            className="form-control"
            name="odometer"
            value={form.odometer}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Return fuel level (%)</label>
          <input
            type="number"
            className="form-control"
            name="fuelLevel"
            value={form.fuelLevel}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Damage notes</label>
          <textarea
            className="form-control"
            name="damageNotes"
            value={form.damageNotes}
            onChange={handleChange}
            rows="2"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Extra charges (₹)</label>
          <input
            type="number"
            className="form-control"
            name="extraCharges"
            value={form.extraCharges}
            onChange={handleChange}
            min="0"
          />
          <div className="form-text">Add a charge here for any damage found during inspection.</div>
        </div>

        <div className="card p-3 bg-soft mb-3">
          <div className="d-flex justify-content-between small">
            <span>Base rental (already charged)</span>
            <span>₹{baseRental}</span>
          </div>
          <div className="d-flex justify-content-between small">
            <span>Damage / extra charges</span>
            <span>₹{extraCharges}</span>
          </div>
          <hr className="my-2" />
          <div className="d-flex justify-content-between fw-bold">
            <span>Total additional charges</span>
            <span>₹{totalAdditional}</span>
          </div>
        </div>

        <button type="submit" className="btn btn-brand btn-lg" disabled={submitting}>
          {submitting ? 'Saving...' : 'Complete return'}
        </button>
      </form>
    </div>
  );
};

export default ReturnInspection;
