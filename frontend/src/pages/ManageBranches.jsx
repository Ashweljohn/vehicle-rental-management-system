import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import vehicleService from '../services/vehicleService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const EMPTY_FORM = { name: '', city: '', address: '', phone: '', status: 'ACTIVE' };

const ManageBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    vehicleService
      .getBranches()
      .then((res) => setBranches(res.data))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (branch) => {
    setForm({
      name: branch.name,
      city: branch.city,
      address: branch.address,
      phone: branch.phone,
      status: branch.status,
    });
    setEditingId(branch._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await vehicleService.updateBranch(editingId, form);
      } else {
        await vehicleService.createBranch(form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this branch?')) return;
    setError(null);
    try {
      await vehicleService.deleteBranch(id);
      load();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar role="ADMIN" />
      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Manage branches</h3>
          <button className="btn btn-accent" onClick={startCreate}>
            + New branch
          </button>
        </div>

        <ErrorMessage error={error} />

        {showForm && (
          <form className="card p-3 mb-4" onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">City</label>
                <input className="form-control" name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="col-md-8">
                <label className="form-label">Address</label>
                <input
                  className="form-control"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
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
            <table className="table bg-white">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b._id}>
                    <td>{b.name}</td>
                    <td>{b.city}</td>
                    <td>{b.phone}</td>
                    <td>
                      <span className={`badge ${b.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(b)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBranches;
