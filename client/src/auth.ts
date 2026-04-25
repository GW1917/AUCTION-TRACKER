import { createAuthClient } from 'better-auth/react';

const NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL as string | undefined;

if (!NEON_AUTH_URL) {
  console.error('VITE_NEON_AUTH_URL is not set. Add it to your environment variables.');
}

export const authClient = createAuthClient({
  baseURL: NEON_AUTH_URL ?? '',
});
