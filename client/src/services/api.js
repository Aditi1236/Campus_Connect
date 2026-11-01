// All communication with the backend lives here (Axios instance + service functions).
import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Origin without "/api" - used to build image URLs such as http://localhost:5000/uploads/x.jpg
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({ baseURL: API_URL });

// Attach the JWT (if we have one) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('findit_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says the token is invalid/expired, clear it and send the user to the login page
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    const isAuthForm = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/password');
    if (error.response?.status === 401 && !isAuthForm && localStorage.getItem('findit_token')) {
      localStorage.removeItem('findit_token');
      window.location.href = '/login?expired=1';
    }
    return Promise.reject(error);
  }
);

// Turns an Axios error into a readable message
export function getErrorMessage(error) {
  return error.response?.data?.message || (error.request ? 'Cannot reach the server. Please check your connection.' : error.message) || 'Something went wrong.';
}

// A small grey placeholder used when an item has no photo
export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#E6EBF3"/><g fill="none" stroke="#9AA8C2" stroke-width="8" stroke-linecap="round"><circle cx="190" cy="140" r="38"/><line x1="218" y1="168" x2="250" y2="200"/></g></svg>'
  );

export function imageUrl(path) {
  if (!path) return PLACEHOLDER_IMAGE;
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}

// ----- Service functions -----
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

export const itemService = {
  list: (params) => api.get('/items', { params }),
  get: (id) => api.get(`/items/${id}`),
  mine: () => api.get('/items/my-listings'),
  create: (formData) => api.post('/items', formData),
  update: (id, formData) => api.put(`/items/${id}`, formData),
  remove: (id) => api.delete(`/items/${id}`),
};

export const claimService = {
  create: (data) => api.post('/claims', data),
  mine: () => api.get('/claims/my-claims'),
  all: (params) => api.get('/claims', { params }),
  setStatus: (id, data) => api.put(`/claims/${id}/status`, data),
};

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  users: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  items: (params) => api.get('/admin/items', { params }),
  setItemStatus: (id, status) => api.put(`/admin/items/${id}/status`, { status }),
  deleteItem: (id) => api.delete(`/admin/items/${id}`),
};

export default api;
