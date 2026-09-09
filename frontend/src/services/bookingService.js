import api from './api';

const getBookings = (params = {}) => api.get('/bookings', { params }).then((res) => res.data);

const getBookingById = (id) => api.get(`/bookings/${id}`).then((res) => res.data);

const createBooking = (payload) => api.post('/bookings', payload).then((res) => res.data);

const cancelBooking = (id) => api.post(`/bookings/${id}/cancel`).then((res) => res.data);

const pickupInspection = (id, payload) =>
  api.post(`/bookings/${id}/pickup`, payload).then((res) => res.data);

const returnInspection = (id, payload) =>
  api.post(`/bookings/${id}/return`, payload).then((res) => res.data);

const getCustomerBookings = (customerId) =>
  api.get(`/customers/${customerId}/bookings`).then((res) => res.data);

const getUsers = (params = {}) => api.get('/users', { params }).then((res) => res.data);

const createUser = (payload) => api.post('/users', payload).then((res) => res.data);

const updateUser = (id, payload) => api.put(`/users/${id}`, payload).then((res) => res.data);

const deleteUser = (id) => api.delete(`/users/${id}`).then((res) => res.data);

export default {
  getBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  pickupInspection,
  returnInspection,
  getCustomerBookings,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
