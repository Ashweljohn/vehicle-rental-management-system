import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vehicleService from '../services/vehicleService';
import VehicleImage from '../components/VehicleImage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const FEATURES = ['Air conditioning', 'Bluetooth', 'GPS available', 'Comfortable seating', 'Well maintained'];

const VehicleDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  useEffect(() => {
    vehicleService
      .getVehicleById(id)
      .then((res) => setVehicle(res.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/booking/new?vehicleId=${id}&startDate=${startDate}&endDate=${endDate}`);
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="container section-sm">
        <ErrorMessage error={error} />
      </div>
    );
  if (!vehicle) return null;

  const seats = vehicle.type === 'BIKE' ? 2 : 5;
  const fuel = vehicle.type === 'BIKE' ? 'Petrol' : 'Petrol / Diesel';
  const transmission = vehicle.type === 'BIKE' ? 'Manual' : 'Manual / Automatic';

  return (
    <div className="container section-sm">
      <div className="row g-4">
        <div className="col-md-6">
          <div className="rounded-xl overflow-hidden" style={{ height: 360 }}>
            <VehicleImage
              vehicle={vehicle}
              width={800}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
        <div className="col-md-6">
          <h2 className="mb-1">
            {vehicle.brand} {vehicle.model} ({vehicle.year})
          </h2>
          <p className="text-muted mb-2">
            {vehicle.type} &middot; Reg. No: {vehicle.registrationNumber}
          </p>
          <p className="mb-3">
            <strong>Branch:</strong> {vehicle.branchId?.name}, {vehicle.branchId?.city}
          </p>

          <div className="price mb-2" style={{ fontSize: '1.8rem' }}>
            ₹{vehicle.perDayRate} <small style={{ fontSize: '0.9rem' }}>/ day</small>
          </div>
          <span
            className={`status-badge mb-4 d-inline-block ${
              vehicle.status === 'AVAILABLE' ? 'status-available' : 'status-booked'
            }`}
          >
            {vehicle.status}
          </span>

          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="card p-3">
                <div className="text-muted small">Type</div>
                <div className="fw-semibold">{vehicle.type}</div>
              </div>
            </div>
            <div className="col-6">
              <div className="card p-3">
                <div className="text-muted small">Seats</div>
                <div className="fw-semibold">{seats}</div>
              </div>
            </div>
            <div className="col-6">
              <div className="card p-3">
                <div className="text-muted small">Fuel</div>
                <div className="fw-semibold">{fuel}</div>
              </div>
            </div>
            <div className="col-6">
              <div className="card p-3">
                <div className="text-muted small">Transmission</div>
                <div className="fw-semibold">{transmission}</div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-accent btn-lg w-100"
            disabled={vehicle.status === 'MAINTENANCE' || vehicle.status === 'INACTIVE'}
            onClick={handleBook}
          >
            Book now
          </button>
          <p className="text-muted small mt-3">
            Final availability for your exact dates is confirmed on the booking page.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <h5 className="mb-3">Vehicle features</h5>
        <div className="row g-3">
          {FEATURES.map((f) => (
            <div className="col-md-4" key={f}>
              <div className="card p-3 d-flex flex-row align-items-center gap-2">
                <span className="text-accent">✓</span> {f}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
