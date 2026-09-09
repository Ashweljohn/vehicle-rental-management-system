import api from './api';

const register = (payload) => api.post('/auth/register', payload).then((res) => res.data);

const login = (payload) => api.post('/auth/login', payload).then((res) => res.data);

const getMe = () => api.get('/auth/me').then((res) => res.data);

export default { register, login, getMe };
