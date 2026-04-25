// Verifies a Neon Auth (Better Auth) session token by calling the
// Neon Auth /get-session endpoint. Results are cached for 5 minutes.

const NEON_AUTH_URL = process.env.NEON_AUTH_URL;

// In-memory session cache: token → { authUser, expiresAt }
const sessionCache = new Map();

async function verifyNeonAuthToken(token) {
  const cached = sessionCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.authUser;
  }

  const resp = await fetch(`${NEON_AUTH_URL}/get-session`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!resp.ok) {
    throw new Error('Invalid or expired token');
  }

  const data = await resp.json();
  if (!data?.user) throw new Error('Invalid session response');

  sessionCache.set(token, { authUser: data.user, expiresAt: Date.now() + 5 * 60 * 1000 });

  if (sessionCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of sessionCache.entries()) {
      if (v.expiresAt < now) sessionCache.delete(k);
    }
  }

  return data.user;
}

async function authMiddleware(req, res, next) {
  if (!NEON_AUTH_URL) {
    return res.status(500).json({ error: 'NEON_AUTH_URL is not configured on the server' });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = header.slice(7);

  try {
    const authUser = await verifyNeonAuthToken(token);
    req.user = {
      authUserId: authUser.id,
      email: authUser.email,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

const { sql } = require('../db/neon');

async function ensureProfile(req, res, next) {
  try {
    const [existing] = await sql`
      SELECT id FROM users WHERE auth_user_id = ${req.user.authUserId}
    `;
    if (existing) {
      req.user.userId = existing.id;
      return next();
    }
    return res.status(403).json({
      error: 'Profile not found. Complete onboarding first.',
      code: 'PROFILE_MISSING',
    });
  } catch (err) {
    console.error('ensureProfile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { authMiddleware, ensureProfile };
