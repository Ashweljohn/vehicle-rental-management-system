import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import vehicleService from '../services/vehicleService';
import VehicleImage from '../components/VehicleImage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const todayISO = () => new Date().toISOString().slice(0, 10);
const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const VehicleSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [branches, setBranches] = useState([]);
  const [vehicles, setVehicles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState('');

  const [filters, setFilters] = useState({
    branchId: searchParams.get('branchId') || '',
    type: searchParams.get('type') || '',
    startDate: searchParams.get('startDate') || todayISO(),
    endDate: searchParams.get('endDate') || tomorrowISO(),
  });

  useEffect(() => {
    vehicleService.getBranches().then((res) => setBranches(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const runSearch = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    setSearched(true);
    try {
      const params = {};
      if (filters.branchId) params.branchId = filters.branchId;
      if (filters.type) params.type = filters.type;
      params.startDate = filters.startDate;
      params.endDate = filters.endDate;

      const res = await vehicleService.searchAvailableVehicles(params);
      setVehicles(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Run an initial search on load using default/URL-provided filters.
  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleVehicles = useMemo(() => {
    if (!vehicles) return null;
    let list = [...vehicles];
    if (maxPrice) {
      list = list.filter((v) => v.perDayRate <= Number(maxPrice));
    }
    if (sortBy === 'price-asc') list.sort((a, b) => a.perDayRate - b.perDayRate);
    if (sortBy === 'price-desc') list.sort((a, b) => b.perDayRate - a.perDayRate);
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [vehicles, sortBy, maxPrice]);

  return (
    <div className="container section-sm">
      <h2 className="section-title">Search available vehicles</h2>
      <p className="section-subtitle">Filter by branch, type, dates and budget.</p>

      <form className="card p-3 mb-4" onSubmit={runSearch}>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Branch</label>
            <select
              className="form-select"
              name="branchId"
              value={filters.branchId}
              onChange={handleChange}
            >
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-semibold">Type</label>
            <select className="form-select" name="type" value={filters.type} onChange={handleChange}>
              <option value="">Any</option>
              <option value="CAR">Car</option>
              <option value="BIKE">Bike</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-semibold">Start date</label>
            <input
              type="date"
              className="form-control"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-semibold">End date</label>
            <input
              type="date"
              className="form-control"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-semibold">Max price / day</label>
            <input
              type="number"
              className="form-control"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
            />
          </div>
          <div className="col-md-1 d-flex align-items-end">
            <button type="submit" className="btn btn-brand w-100">
              Go
            </button>
          </div>
        </div>
      </form>

      <ErrorMessage error={error} />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Available vehicles</h5>
        {visibleVehicles && visibleVehicles.length > 0 && (
          <select
            className="form-select form-select-sm"
            style={{ width: 200 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        )}
      </div>

      {loading && <Loading label="Searching vehicles..." />}

      {!loading && searched && visibleVehicles && visibleVehicles.length === 0 && (
        <div className="card p-5 text-center">
          <h5 className="mb-2">No vehicles available for these dates.</h5>
          <p className="text-muted mb-3">Try a different date range, branch, or vehicle type.</p>
          <button
            className="btn btn-outline-brand mx-auto"
            style={{ maxWidth: 200 }}
            onClick={() =>
              setFilters({ branchId: '', type: '', startDate: todayISO(), endDate: tomorrowISO() })
            }
          >
            Change search
          </button>
        </div>
      )}

      <div className="row g-4">
        {!loading &&
          visibleVehicles &&
          visibleVehicles.map((v) => (
            <div className="col-md-4 col-lg-3" key={v._id}>
              <div className="card vehicle-card h-100">
                <div className="img-wrap">
                  <VehicleImage vehicle={v} width={500} />
                </div>
                <div className="card-body d-flex flex-column">
                  <h6 className="mb-1">
                    {v.brand} {v.model}
                  </h6>
                  <div className="text-muted small mb-2">
                    {v.type} &middot; {v.branchId?.name} ({v.branchId?.city})
                  </div>
                  <div className="price mb-2">
                    ₹{v.perDayRate} <small>/ day</small>
                  </div>
                  <span className="status-badge status-available align-self-start mb-3">
                    Available
                  </span>
                  <button
                    className="btn btn-accent mt-auto"
                    onClick={() =>
                      navigate(
                        `/vehicles/${v._id}?startDate=${filters.startDate}&endDate=${filters.endDate}`
                      )
                    }
                  >
                    View & book
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default VehicleSearch;
