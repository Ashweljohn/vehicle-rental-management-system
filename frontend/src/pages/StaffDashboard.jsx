import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import VehicleImage from '../components/VehicleImage';
import bookingService from '../services/bookingService';
import vehicleService from '../services/vehicleService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingService.getBookings(),
      vehicleService.getVehicles({ branchId: user?.branchId }),
    ])
      .then(([bRes, vRes]) => {
        setBookings(bRes.data);
        setFleet(vRes.data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const pendingPickups = bookings.filter((b) => b.status === 'RESERVED');
  const activeRentals = bookings.filter((b) => b.status === 'PICKED_UP');
  const pendingReturns = activeRentals;
  const todaysActivities = [...pendingPickups, ...pendingReturns].slice(0, 8);

  return (
    <div className="d-flex">
      <Sidebar role="BRANCH_STAFF" />
      <div className="flex-grow-1 p-4">
        <h3 className="mb-4">Branch operations</h3>
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <div className="stat-card">
                  <div className="stat-icon">🔑</div>
                  <div className="stat-value">{pendingPickups.length}</div>
                  <div className="stat-label">Pending pickups</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card">
                  <div className="stat-icon">🚙</div>
                  <div className="stat-value">{activeRentals.length}</div>
                  <div className="stat-label">Active rentals</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card">
                  <div className="stat-icon">↩️</div>
                  <div className="stat-value">{pendingReturns.length}</div>
                  <div className="stat-label">Pending returns</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card">
                  <div className="stat-icon">🏢</div>
                  <div className="stat-value">{fleet.length}</div>
                  <div className="stat-label">Local fleet</div>
                </div>
              </div>
            </div>

            <h5 className="mb-3">Today's activities</h5>
            <div className="table-responsive mb-4">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {todaysActivities.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-xl overflow-hidden" style={{ width: 56, height: 42 }}>
                            <VehicleImage
                              vehicle={b.vehicleId}
                              width={200}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          {b.vehicleId?.brand} {b.vehicleId?.model}
                        </div>
                      </td>
                      <td>{b.customerId?.name}</td>
                      <td>
                        {new Date(b.startDate).toLocaleDateString()} &rarr;{' '}
                        {new Date(b.endDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge badge-${b.status}`}>{b.status}</span>
                      </td>
                      <td>
                        {b.status === 'RESERVED' && (
                          <button
                            className="btn btn-sm btn-accent"
                            onClick={() => navigate(`/staff/pickup/${b._id}`)}
                          >
                            Pickup inspection
                          </button>
                        )}
                        {b.status === 'PICKED_UP' && (
                          <button
                            className="btn btn-sm btn-brand"
                            onClick={() => navigate(`/staff/return/${b._id}`)}
                          >
                            Return inspection
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {todaysActivities.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-muted text-center py-4">
                        No pending pickups or returns right now.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
