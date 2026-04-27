const { createRemoteJWKSet, jwtVerify } = require('jose');
const { sql } = require('../db/neon');

const NEON_AUTH_URL = process.env.NEON_AUTH_URL;

// The JWT issuer/audience is the origin only (no path), even though
// NEON_AUTH_URL includes the /neondb/auth path.
function getNeonOrigin() {
  return new URL(NEON_AUTH_URL).origin;
}

// Cache the JWKS remote key set (auto-refreshes on key rotation)
let _jwks = null;
function getJWKS() {
  if (!_jwks) {
    const jwksUrl = new URL(`${NEON_AUTH_URL}/.well-known/jwks.json`);
    _jwks = createRemoteJWKSet(jwksUrl);
  }
  return _jwks;
}

async function authMiddleware(req, res, next) {
  if (!NEON_AUTH_URL) return res.status(500).json({ error: 'NEON_AUTH_URL not configured' });

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authorization token required' });

  const token = header.slice(7);

  try {
    const origin = getNeonOrigin();
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: origin,
      audience: origin,
    });
    // payload.sub is the Neon Auth user ID, payload.email is the email
    req.user = {
      authUserId: payload.sub,
      email: payload.email,
    };
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Attaches req.user.role, req.user.userId, req.user.dealershipId
// and enforces that caller has one of the allowed roles.
function touchLastSeen(authUserId) {
  sql`UPDATE users SET last_seen_at = NOW() WHERE auth_user_id = ${authUserId}`.catch(() => {});
}

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
      touchLastSeen(req.user.authUserId);
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
    touchLastSeen(req.user.authUserId);
    next();
  } catch (err) {
    console.error('ensureProfile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { authMiddleware, requireRole, ensureProfile };
