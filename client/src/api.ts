import axios from 'axios';
import { authClient } from './auth';

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'https://auction-tracker-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL + '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  try {
    const session = await authClient.getSession();
    const token = session?.data?.session?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // unauthenticated — let the request go through
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await authClient.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
