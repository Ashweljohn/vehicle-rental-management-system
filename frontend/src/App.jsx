import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import VehicleSearch from './pages/VehicleSearch';
import VehicleDetails from './pages/VehicleDetails';
import CreateBooking from './pages/CreateBooking';

import CustomerDashboard from './pages/CustomerDashboard';
import MyBookings from './pages/MyBookings';
import RentalHistory from './pages/RentalHistory';

import StaffDashboard from './pages/StaffDashboard';
import PickupInspection from './pages/PickupInspection';
import ReturnInspection from './pages/ReturnInspection';

import AdminDashboard from './pages/AdminDashboard';
import ManageBranches from './pages/ManageBranches';
import ManageVehicles from './pages/ManageVehicles';
import ManageAddons from './pages/ManageAddons';
import ManageUsers from './pages/ManageUsers';
import Reports from './pages/Reports';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<VehicleSearch />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Any authenticated user */}
        <Route
          path="/booking/new"
          element={
            <ProtectedRoute>
              <CreateBooking />
            </ProtectedRoute>
          }
        />

        {/* Customer only */}
        <Route
          path="/customer/dashboard"
          element={
            <RoleRoute roles={['CUSTOMER']}>
              <CustomerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/customer/bookings"
          element={
            <RoleRoute roles={['CUSTOMER']}>
              <MyBookings />
            </RoleRoute>
          }
        />
        <Route
          path="/customer/history"
          element={
            <RoleRoute roles={['CUSTOMER']}>
              <RentalHistory />
            </RoleRoute>
          }
        />

        {/* Branch staff only */}
        <Route
          path="/staff/dashboard"
          element={
            <RoleRoute roles={['BRANCH_STAFF', 'ADMIN']}>
              <StaffDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/staff/pickup/:id"
          element={
            <RoleRoute roles={['BRANCH_STAFF', 'ADMIN']}>
              <PickupInspection />
            </RoleRoute>
          }
        />
        <Route
          path="/staff/return/:id"
          element={
            <RoleRoute roles={['BRANCH_STAFF', 'ADMIN']}>
              <ReturnInspection />
            </RoleRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute roles={['ADMIN']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/branches"
          element={
            <RoleRoute roles={['ADMIN']}>
              <ManageBranches />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/vehicles"
          element={
            <RoleRoute roles={['ADMIN']}>
              <ManageVehicles />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/addons"
          element={
            <RoleRoute roles={['ADMIN']}>
              <ManageAddons />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute roles={['ADMIN']}>
              <ManageUsers />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleRoute roles={['ADMIN']}>
              <Reports />
            </RoleRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
