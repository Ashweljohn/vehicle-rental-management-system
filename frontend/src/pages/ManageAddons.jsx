import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import vehicleService from '../services/vehicleService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const EMPTY_FORM = { name: '', description: '', price: '', isActive: true };

const ManageAddons = () => {
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    vehicleService
      .getAddOns()
      .then((res) => setAddOns(res.data))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (a) => {
    setForm({ name: a.name, description: a.description, price: a.price, isActive: a.isActive });
    setEditingId(a._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = { ...form, price: Number(form.price) };
    try {
      if (editingId) {
        await vehicleService.updateAddOn(editingId, payload);
      } else {
        await vehicleService.createAddOn(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err);
    }
  };

  const toggleActive = async (a) => {
    setError(null);
    try {
      await vehicleService.updateAddOn(a._id, { isActive: !a.isActive });
      load();
    } catch (err) {
      setError(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this add-on?')) return;
    setError(null);
    try {
      await vehicleService.deleteAddOn(id);
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
          <h3 className="mb-0">Manage add-ons</h3>
          <button className="btn btn-accent" onClick={startCreate}>
            + New add-on
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
              <div className="col-md-2">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Description</label>
                <input
                  className="form-control"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4 d-flex align-items-center">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    id="isActiveCheck"
                  />
                  <label className="form-check-label" htmlFor="isActiveCheck">
                    Active
                  </label>
                </div>
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
                  <th>Description</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {addOns.map((a) => (
                  <tr key={a._id}>
                    <td>{a.name}</td>
                    <td>{a.description}</td>
                    <td>₹{a.price}</td>
                    <td>
                      <span className={`badge ${a.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {a.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(a)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleActive(a)}>
                        {a.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a._id)}>
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

export default ManageAddons;
