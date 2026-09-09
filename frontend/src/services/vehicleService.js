import api from './api';

const getVehicles = (params = {}) => api.get('/vehicles', { params }).then((res) => res.data);

const searchAvailableVehicles = (params) =>
  api.get('/vehicles/search', { params }).then((res) => res.data);

const getVehicleById = (id) => api.get(`/vehicles/${id}`).then((res) => res.data);

const createVehicle = (payload) => api.post('/vehicles', payload).then((res) => res.data);

const updateVehicle = (id, payload) => api.put(`/vehicles/${id}`, payload).then((res) => res.data);

const deleteVehicle = (id) => api.delete(`/vehicles/${id}`).then((res) => res.data);

const getBranches = () => api.get('/branches').then((res) => res.data);

const createBranch = (payload) => api.post('/branches', payload).then((res) => res.data);

const updateBranch = (id, payload) => api.put(`/branches/${id}`, payload).then((res) => res.data);

const deleteBranch = (id) => api.delete(`/branches/${id}`).then((res) => res.data);

const getAddOns = (params = {}) => api.get('/addons', { params }).then((res) => res.data);

const createAddOn = (payload) => api.post('/addons', payload).then((res) => res.data);

const updateAddOn = (id, payload) => api.put(`/addons/${id}`, payload).then((res) => res.data);

const deleteAddOn = (id) => api.delete(`/addons/${id}`).then((res) => res.data);

export default {
  getVehicles,
  searchAvailableVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getAddOns,
  createAddOn,
  updateAddOn,
  deleteAddOn,
};
