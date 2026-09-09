import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const dashboardPathFor = (role) => {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'BRANCH_STAFF') return '/staff/dashboard';
  return '/customer/dashboard';
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark rh-navbar sticky-top px-3 px-lg-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          🚗 RentalHub
        </Link>
        <button
          className="navbar-toggler border-0 text-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav me-auto ms-lg-4 mt-2 mt-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/search">
                Vehicles
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">
                Contact
              </NavLink>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2 mt-2 mt-lg-0">
            <li className="nav-item">
              <Link className="btn btn-accent btn-sm" to="/search">
                Search vehicles
              </Link>
            </li>
            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Log in
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-brand btn-sm ms-lg-1" to="/register">
                    Sign up
                  </Link>
                </li>
              </>
            )}
            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to={dashboardPathFor(user.role)}>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item user-chip d-flex align-items-center px-2">
                  {user.name}
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-brand btn-sm" onClick={handleLogout}>
                    Log out
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
