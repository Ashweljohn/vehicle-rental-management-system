import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

const dashboardPathFor = (role) => {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'BRANCH_STAFF') return '/staff/dashboard';
  return '/customer/dashboard';
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.from?.pathname || dashboardPathFor(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 460 }}>
      <div className="card shadow-sm mt-5 p-4">
        <h3 className="mb-3">Log in</h3>
        <ErrorMessage error={error} />
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
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
          <div className="mb-3">
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
          <button type="submit" className="btn btn-brand w-100" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="text-muted small mt-3 mb-0">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
        <div className="mt-3 p-2 bg-light rounded small text-muted">
          Demo accounts: <br />
          admin@rental.com / Admin@123 <br />
          staff@rental.com / Staff@123 <br />
          customer@rental.com / Customer@123
        </div>
      </div>
    </div>
  );
};

export default Login;
