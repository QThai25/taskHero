// src/api/axios.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Set token (call after login)
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Optionally, automatic attach token from localStorage on app start
const stored = localStorage.getItem('token');
if (stored) setAuthToken(stored);

export default api;
