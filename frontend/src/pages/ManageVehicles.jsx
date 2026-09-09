import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import vehicleService from '../services/vehicleService';
import VehicleImage from '../components/VehicleImage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const STATUS_CLASS = {
  AVAILABLE: 'status-available',
  BOOKED: 'status-booked',
  MAINTENANCE: 'status-maintenance',
  INACTIVE: 'status-inactive',
};

const EMPTY_FORM = {
  registrationNumber: '',
  type: 'CAR',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  perDayRate: '',
  branchId: '',
  status: 'AVAILABLE',
  image: '',
};

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([vehicleService.getVehicles(), vehicleService.getBranches()])
      .then(([vRes, bRes]) => {
        setVehicles(vRes.data);
        setBranches(bRes.data);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startCreate = () => {
    setForm({ ...EMPTY_FORM, branchId: branches[0]?._id || '' });
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (v) => {
    setForm({
      registrationNumber: v.registrationNumber,
      type: v.type,
      brand: v.brand,
      model: v.model,
      year: v.year,
      perDayRate: v.perDayRate,
      branchId: v.branchId?._id || v.branchId,
      status: v.status,
      image: v.image || '',
    });
    setEditingId(v._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = { ...form, year: Number(form.year), perDayRate: Number(form.perDayRate) };
    try {
      if (editingId) {
        await vehicleService.updateVehicle(editingId, payload);
      } else {
        await vehicleService.createVehicle(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    setError(null);
    try {
      await vehicleService.deleteVehicle(id);
      load();
    } catch (err) {
      setError(err);
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        !search ||
        `${v.brand} ${v.model} ${v.registrationNumber}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, statusFilter]);

  return (
    <div className="d-flex">
      <Sidebar role="ADMIN" />
      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h3 className="mb-0">Manage vehicles</h3>
          <div className="d-flex gap-2">
            <input
              className="form-control form-control-sm"
              placeholder="Search brand, model, reg. no"
              style={{ width: 220 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-select form-select-sm"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="BOOKED">Booked</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <button className="btn btn-accent" onClick={startCreate}>
              + New vehicle
            </button>
          </div>
        </div>

        <ErrorMessage error={error} />

        {showForm && (
          <form className="card p-3 mb-4" onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Registration number</label>
                <input
                  className="form-control"
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Type</label>
                <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                  <option value="CAR">Car</option>
                  <option value="BIKE">Bike</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Brand</label>
                <input className="form-control" name="brand" value={form.brand} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Model</label>
                <input className="form-control" name="model" value={form.model} onChange={handleChange} required />
              </div>
              <div className="col-md-2">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  className="form-control"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Per-day rate</label>
                <input
                  type="number"
                  className="form-control"
                  name="perDayRate"
                  value={form.perDayRate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Branch</label>
                <select className="form-select" name="branchId" value={form.branchId} onChange={handleChange} required>
                  <option value="">Select branch</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="AVAILABLE">Available</option>
                  <option value="BOOKED">Booked</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Image URL</label>
                <input className="form-control" name="image" value={form.image} onChange={handleChange} />
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-brand">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <Loading />
        ) : (
          <div className="table-responsive">
            <table className="table align-middle bg-white">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Reg. No</th>
                  <th>Vehicle</th>
                  <th>Branch</th>
                  <th>Rate/day</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => (
                  <tr key={v._id}>
                    <td>
                      <div className="rounded-xl overflow-hidden" style={{ width: 64, height: 48 }}>
                        <VehicleImage
                          vehicle={v}
                          width={200}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td>{v.registrationNumber}</td>
                    <td>
                      {v.brand} {v.model} ({v.type})
                    </td>
                    <td>{v.branchId?.name}</td>
                    <td>₹{v.perDayRate}</td>
                    <td>
                      <span className={`status-badge ${STATUS_CLASS[v.status] || 'status-inactive'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(v)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(v._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredVehicles.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No vehicles match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVehicles;
