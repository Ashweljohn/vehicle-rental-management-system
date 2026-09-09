import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import reportService from '../services/reportService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const STATUS_COLORS = {
  AVAILABLE: '#1f6f5c',
  BOOKED: '#e08e2b',
  MAINTENANCE: '#c4761a',
  INACTIVE: '#9ca3af',
};

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [utilization, setUtilization] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      reportService.getDashboardSummary(),
      reportService.getUtilizationReport(),
      reportService.getRevenueReport(),
    ])
      .then(([sRes, uRes, rRes]) => {
        setSummary(sRes.data);
        setUtilization(uRes.data);
        setRevenue(rRes.data);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const statusPieData = utilization
    ? ['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'INACTIVE']
        .map((key) => ({ name: key, value: utilization.overall[key] }))
        .filter((d) => d.value > 0)
    : [];

  const revenueByBranchData = revenue?.revenueByBranch?.map((r) => ({
    name: r.branchName || 'Unknown',
    revenue: r.revenue,
  }));

  return (
    <div className="d-flex">
      <Sidebar role="ADMIN" />
      <div className="flex-grow-1 p-4">
        <h3 className="mb-4">Admin dashboard</h3>
        <ErrorMessage error={error} />
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-2">
                <div className="stat-card">
                  <div className="stat-icon">🚗</div>
                  <div className="stat-value">{summary?.totalVehicles}</div>
                  <div className="stat-label">Total vehicles</div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-value">{summary?.availableVehicles}</div>
                  <div className="stat-label">Available</div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-value">{summary?.activeBookings}</div>
                  <div className="stat-label">Active bookings</div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="stat-card">
                  <div className="stat-icon">👤</div>
                  <div className="stat-value">{summary?.totalCustomers}</div>
                  <div className="stat-label">Customers</div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="stat-card">
                  <div className="stat-icon">🏢</div>
                  <div className="stat-value">{summary?.totalBranches}</div>
                  <div className="stat-label">Branches</div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="stat-card">
                  <div className="stat-icon">₹</div>
                  <div className="stat-value">₹{summary?.totalRevenue}</div>
                  <div className="stat-label">Revenue</div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-5">
                <div className="card p-4 h-100">
                  <h6 className="mb-3">Vehicle status distribution</h6>
                  {statusPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={(d) => `${d.name}: ${d.value}`}
                        >
                          {statusPieData.map((entry) => (
                            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#999'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted">No vehicle data yet.</p>
                  )}
                </div>
              </div>
              <div className="col-md-7">
                <div className="card p-4 h-100">
                  <h6 className="mb-3">Revenue by branch</h6>
                  {revenueByBranchData && revenueByBranchData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={revenueByBranchData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#1f6f5c" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted">No completed bookings yet.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
