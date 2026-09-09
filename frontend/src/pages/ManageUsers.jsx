import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import bookingService from '../services/bookingService';
import vehicleService from '../services/vehicleService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'BRANCH_STAFF',
  branchId: '',
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([bookingService.getUsers(), vehicleService.getBranches()])
      .then(([uRes, bRes]) => {
        setUsers(uRes.data);
        setBranches(bRes.data);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await bookingService.createUser({
        ...form,
        branchId: form.role === 'BRANCH_STAFF' ? form.branchId : undefined,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err);
    }
  };

  const toggleActive = async (u) => {
    setError(null);
    try {
      if (u.isActive) {
        await bookingService.deleteUser(u._id); // soft-deactivate
      } else {
        await bookingService.updateUser(u._id, { isActive: true });
      }
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
          <h3 className="mb-0">Manage users</h3>
          <button className="btn btn-accent" onClick={() => setShowForm((s) => !s)}>
            + New staff/admin user
          </button>
        </div>

        <ErrorMessage error={error} />

        {showForm && (
          <form className="card p-3 mb-4" onSubmit={handleCreate}>
            <p className="text-muted small">
              Customers self-register from the sign-up page. Use this form only for Branch Staff or
              Admin accounts.
            </p>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="col-md-2">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Role</label>
                <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                  <option value="BRANCH_STAFF">Branch staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {form.role === 'BRANCH_STAFF' && (
                <div className="col-md-4">
                  <label className="form-label">Branch</label>
                  <select
                    className="form-select"
                    name="branchId"
                    value={form.branchId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select branch</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-brand">
                Create user
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
                  <th>Email</th>
                  <th>Role</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.branchId?.name || '-'}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleActive(u)}>
                        {u.isActive ? 'Deactivate' : 'Reactivate'}
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

export default ManageUsers;
