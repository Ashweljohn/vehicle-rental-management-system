import api from './api';

const getDashboardSummary = () => api.get('/admin/reports/dashboard').then((res) => res.data);

const getUtilizationReport = () => api.get('/admin/reports/utilization').then((res) => res.data);

const getRevenueReport = () => api.get('/admin/reports/revenue').then((res) => res.data);

export default { getDashboardSummary, getUtilizationReport, getRevenueReport };
