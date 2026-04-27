import { createAuthClient } from 'better-auth/react';

const NEON_AUTH_URL =
  (import.meta.env.VITE_NEON_AUTH_URL as string | undefined) ||
  'https://ep-fancy-cell-ane5rb1m.neonauth.c-6.us-east-1.aws.neon.tech/neondb/auth';

const AUTH_JWT_KEY = 'neon_auth_jwt';

/** Retrieve the stored Neon Auth JWT for use in API calls */
export function getStoredAuthJWT(): string | null {
  return sessionStorage.getItem(AUTH_JWT_KEY);
}

export const authClient = createAuthClient({
  baseURL: NEON_AUTH_URL,
  fetchOptions: {
    // Every response from Neon Auth that carries set-auth-jwt (e.g. /get-session)
    // exposes a short-lived EdDSA JWT our server can verify without a round-trip.
    onResponse: (context: { response: Response }) => {
      const jwt = context.response.headers.get('set-auth-jwt');
      if (jwt) {
        sessionStorage.setItem(AUTH_JWT_KEY, jwt);
      }
    },
  },
});
