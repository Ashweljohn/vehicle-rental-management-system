import React from 'react';
import { NavLink } from 'react-router-dom';

const LINKS = {
  CUSTOMER: [
    { to: '/customer/dashboard', label: 'Overview' },
    { to: '/search', label: 'Search vehicles' },
    { to: '/customer/bookings', label: 'My bookings' },
    { to: '/customer/history', label: 'Rental history' },
  ],
  BRANCH_STAFF: [
    { to: '/staff/dashboard', label: 'Overview' },
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Overview' },
    { to: '/admin/branches', label: 'Branches' },
    { to: '/admin/vehicles', label: 'Vehicles' },
    { to: '/admin/addons', label: 'Add-ons' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/reports', label: 'Reports' },
  ],
};

const Sidebar = ({ role }) => {
  const links = LINKS[role] || [];

  return (
    <div className="sidebar p-3">
      <nav className="d-flex flex-column gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
