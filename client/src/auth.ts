import { createAuthClient } from 'better-auth/react';

const NEON_AUTH_URL =
  (import.meta.env.VITE_NEON_AUTH_URL as string | undefined) ||
  'https://ep-fancy-cell-ane5rb1m.neonauth.c-6.us-east-1.aws.neon.tech/neondb/auth';

export const authClient = createAuthClient({ baseURL: NEON_AUTH_URL });
