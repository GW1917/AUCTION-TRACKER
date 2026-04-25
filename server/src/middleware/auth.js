const NEON_AUTH_URL = process.env.NEON_AUTH_URL;
const { sql } = require('../db/neon');

const sessionCache = new Map();

async function verifyNeonAuthToken(token) {
  const cached = sessionCache.get(token);
  if (cached && cached.expiresAt > Date.now()) return cached.authUser;

  const resp = await fetch(`${NEON_AUTH_URL}/get-session`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error('Invalid or expired token');

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
  if (!NEON_AUTH_URL) return res.status(500).json({ error: 'NEON_AUTH_URL not configured' });

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authorization token required' });

  try {
    const authUser = await verifyNeonAuthToken(header.slice(7));
    req.user = { authUserId: authUser.id, email: authUser.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Attaches req.user.role, req.user.userId, req.user.dealershipId
// and enforces that caller has one of the allowed roles.
function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const [user] = await sql`
        SELECT id, role, dealership_id FROM users
        WHERE auth_user_id = ${req.user.authUserId}
      `;
      if (!user) return res.status(403).json({ error: 'Profile not found', code: 'PROFILE_MISSING' });
      if (!roles.includes(user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
      req.user.userId = user.id;
      req.user.role = user.role;
      req.user.dealershipId = user.dealership_id;
      next();
    } catch (err) {
      console.error('requireRole error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

async function ensureProfile(req, res, next) {
  try {
    const [user] = await sql`
      SELECT id, role, dealership_id FROM users WHERE auth_user_id = ${req.user.authUserId}
    `;
    if (!user) return res.status(403).json({ error: 'Profile not found', code: 'PROFILE_MISSING' });
    req.user.userId = user.id;
    req.user.role = user.role;
    req.user.dealershipId = user.dealership_id;
    next();
  } catch (err) {
    console.error('ensureProfile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { authMiddleware, requireRole, ensureProfile };
