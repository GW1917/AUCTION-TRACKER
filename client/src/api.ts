import axios from 'axios';
import { authClient, getStoredAuthJWT } from './auth';

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'https://auction-tracker-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL + '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

function jwtIsExpired(jwt: string): boolean {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    // Treat as expired 60 seconds before actual expiry so we refresh proactively
    return payload.exp * 1000 < Date.now() + 60_000;
  } catch {
    return true;
  }
}

async function getFreshJWT(): Promise<string | null> {
  // Trigger a /get-session call — the onResponse hook in auth.ts captures
  // the set-auth-jwt header and stores the EdDSA JWT in sessionStorage.
  await authClient.getSession();
  return getStoredAuthJWT();
}

api.interceptors.request.use(async (config) => {
  try {
    let jwt = getStoredAuthJWT();

    // Refresh if missing or within 60 s of expiry
    if (!jwt || jwtIsExpired(jwt)) {
      jwt = await getFreshJWT();
    }

    if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
  } catch {
    // unauthenticated — let request through without a token
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // One retry after refreshing the JWT in case it just expired mid-flight
      const originalRequest = error.config;
      if (!originalRequest._retried) {
        originalRequest._retried = true;
        try {
          const jwt = await getFreshJWT();
          if (jwt) {
            originalRequest.headers.Authorization = `Bearer ${jwt}`;
            return api(originalRequest);
          }
        } catch {
          // fall through to sign-out
        }
      }
      await authClient.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
