import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import VehicleImage from '../components/VehicleImage';
import bookingService from '../services/bookingService';
import Loading from '../components/Loading';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService
      .getBookings()
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  }, []);

  const active = bookings.filter((b) => ['RESERVED', 'PICKED_UP'].includes(b.status));
  const completed = bookings.filter((b) => b.status === 'RETURNED');
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED');
  const upcoming = active
    .slice()
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
  const recent = bookings.slice(0, 5);

  return (
    <div className="d-flex">
      <Sidebar role="CUSTOMER" />
      <div className="flex-grow-1 p-4">
        <h3 className="mb-4">Welcome back</h3>
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-value">{bookings.length}</div>
                  <div className="stat-label">Total bookings</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card">
                  <div className="stat-icon">🚗</div>
                  <div className="stat-value">{active.length}</div>
                  <div className="stat-label">Active rentals</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-value">{completed.length}</div>
                  <div className="stat-label">Completed rentals</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card">
                  <div className="stat-icon">✕</div>
                  <div className="stat-value">{cancelled.length}</div>
                  <div className="stat-label">Cancelled</div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Upcoming rental</h5>
              <button className="btn btn-brand btn-sm" onClick={() => navigate('/search')}>
                Search vehicles
              </button>
            </div>

            {upcoming ? (
              <div className="card p-3 mb-4 d-flex flex-row gap-3 align-items-center flex-wrap">
                <div className="rounded-xl overflow-hidden" style={{ width: 140, height: 90, flexShrink: 0 }}>
                  <VehicleImage
                    vehicle={upcoming.vehicleId}
                    width={300}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <strong>
                    {upcoming.vehicleId?.brand} {upcoming.vehicleId?.model}
                  </strong>
                  <div className="text-muted small">
                    {new Date(upcoming.startDate).toLocaleDateString()} &rarr;{' '}
                    {new Date(upcoming.endDate).toLocaleDateString()}
                  </div>
                  <span className={`badge badge-${upcoming.status} mt-1`}>{upcoming.status}</span>
                </div>
              </div>
            ) : (
              <div className="card p-4 text-center mb-4">
                <p className="text-muted mb-3">No upcoming rentals right now.</p>
                <button
                  className="btn btn-accent mx-auto"
                  style={{ maxWidth: 200 }}
                  onClick={() => navigate('/search')}
                >
                  Browse vehicles
                </button>
              </div>
            )}

            <h5 className="mb-3">Recent bookings</h5>
            {recent.length === 0 && <p className="text-muted">No bookings yet.</p>}
            <div className="row g-3">
              {recent.map((b) => (
                <div className="col-md-4" key={b._id}>
                  <div className="card p-3 h-100">
                    <div className="d-flex gap-2 align-items-center mb-2">
                      <div className="rounded-xl overflow-hidden" style={{ width: 60, height: 45, flexShrink: 0 }}>
                        <VehicleImage
                          vehicle={b.vehicleId}
                          width={200}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <strong className="small">
                        {b.vehicleId?.brand} {b.vehicleId?.model}
                      </strong>
                    </div>
                    <div className="text-muted small">
                      {new Date(b.startDate).toLocaleDateString()} &rarr;{' '}
                      {new Date(b.endDate).toLocaleDateString()}
                    </div>
                    <span className={`badge badge-${b.status} mt-2 align-self-start`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
