import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import reportService from '../services/reportService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Reports = () => {
  const [utilization, setUtilization] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([reportService.getUtilizationReport(), reportService.getRevenueReport()])
      .then(([uRes, rRes]) => {
        setUtilization(uRes.data);
        setRevenue(rRes.data);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="d-flex">
      <Sidebar role="ADMIN" />
      <div className="flex-grow-1 p-4">
        <h3 className="mb-4">Reports</h3>
        <ErrorMessage error={error} />
        {loading ? (
          <Loading />
        ) : (
          <>
            <h5>Fleet utilization (overall)</h5>
            {utilization && (
              <div className="row g-3 mb-4">
                <div className="col-md-2">
                  <div className="stat-card">
                    <div className="stat-value">{utilization.overall.totalVehicles}</div>
                    <div className="stat-label">Total vehicles</div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="stat-card">
                    <div className="stat-value">{utilization.overall.AVAILABLE}</div>
                    <div className="stat-label">Available</div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="stat-card">
                    <div className="stat-value">{utilization.overall.BOOKED}</div>
                    <div className="stat-label">Booked</div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="stat-card">
                    <div className="stat-value">{utilization.overall.MAINTENANCE}</div>
                    <div className="stat-label">Maintenance</div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="stat-card">
                    <div className="stat-value">{utilization.overall.utilizationPercentage}%</div>
                    <div className="stat-label">Utilization</div>
                  </div>
                </div>
              </div>
            )}

            <h6>Utilization by branch</h6>
            <div className="table-responsive mb-4">
              <table className="table bg-white">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Total</th>
                    <th>Available</th>
                    <th>Booked</th>
                    <th>Maintenance</th>
                    <th>Utilization %</th>
                  </tr>
                </thead>
                <tbody>
                  {utilization?.perBranch.map((b) => (
                    <tr key={b.branchId}>
                      <td>{b.branchName}</td>
                      <td>{b.totalVehicles}</td>
                      <td>{b.AVAILABLE}</td>
                      <td>{b.BOOKED}</td>
                      <td>{b.MAINTENANCE}</td>
                      <td>{b.utilizationPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h5>Revenue</h5>
            {revenue && (
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="stat-card">
                    <div className="stat-value">₹{revenue.totalCompletedRevenue}</div>
                    <div className="stat-label">Completed booking revenue</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card">
                    <div className="stat-value">₹{revenue.totalCancellationRevenue}</div>
                    <div className="stat-label">Cancellation charges collected</div>
                  </div>
                </div>
              </div>
            )}

            <h6>Revenue by branch</h6>
            <div className="table-responsive mb-4">
              <table className="table bg-white">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue?.revenueByBranch.map((r) => (
                    <tr key={r.branchId}>
                      <td>{r.branchName}</td>
                      <td>{r.bookings}</td>
                      <td>₹{r.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h6>Revenue by vehicle</h6>
            <div className="table-responsive">
              <table className="table bg-white">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Reg. No</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue?.revenueByVehicle.map((r) => (
                    <tr key={r.vehicleId}>
                      <td>
                        {r.brand} {r.model}
                      </td>
                      <td>{r.registrationNumber}</td>
                      <td>{r.bookings}</td>
                      <td>₹{r.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
