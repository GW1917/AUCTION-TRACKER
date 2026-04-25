const express = require('express');
const { sql } = require('../db/neon');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

const ownerOrAdmin = [authMiddleware, requireRole('owner', 'admin')];
const ownerOnly    = [authMiddleware, requireRole('owner')];

// GET /api/dealership/members — all approved members
router.get('/members', ...ownerOrAdmin, async (req, res) => {
  try {
    const members = await sql`
      SELECT id, email, full_name, role, last_seen_at, created_at
      FROM users
      WHERE dealership_id = ${req.user.dealershipId}
        AND role IN ('owner', 'admin', 'member')
      ORDER BY
        CASE role WHEN 'owner' THEN 1 WHEN 'admin' THEN 2 ELSE 3 END,
        created_at ASC
    `;
    res.json(members.map(m => ({
      id: m.id, email: m.email, fullName: m.full_name, role: m.role,
      lastSeenAt: m.last_seen_at, createdAt: m.created_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET /api/dealership/pending — users awaiting approval
router.get('/pending', ...ownerOrAdmin, async (req, res) => {
  try {
    const pending = await sql`
      SELECT id, email, full_name, created_at
      FROM users
      WHERE dealership_id = ${req.user.dealershipId} AND role = 'pending'
      ORDER BY created_at ASC
    `;
    res.json(pending.map(p => ({
      id: p.id, email: p.email, fullName: p.full_name, createdAt: p.created_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending members' });
  }
});

// POST /api/dealership/approve/:userId
router.post('/approve/:userId', ...ownerOrAdmin, async (req, res) => {
  try {
    const [user] = await sql`
      UPDATE users SET role = 'member'
      WHERE id = ${req.params.userId}
        AND dealership_id = ${req.user.dealershipId}
        AND role = 'pending'
      RETURNING id, email, full_name, role
    `;
    if (!user) return res.status(404).json({ error: 'User not found or already approved' });
    res.json({ id: user.id, email: user.email, fullName: user.full_name, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve member' });
  }
});

// DELETE /api/dealership/reject/:userId — reject or remove a member
router.delete('/remove/:userId', ...ownerOrAdmin, async (req, res) => {
  try {
    // Owner can remove anyone except themselves; admin can only remove members/pending
    const [target] = await sql`
      SELECT id, role FROM users
      WHERE id = ${req.params.userId} AND dealership_id = ${req.user.dealershipId}
    `;
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.role === 'owner') return res.status(403).json({ error: 'Cannot remove the owner' });
    if (req.user.role === 'admin' && target.role === 'admin') {
      return res.status(403).json({ error: 'Admins cannot remove other admins' });
    }

    await sql`
      UPDATE users SET dealership_id = NULL, role = 'member'
      WHERE id = ${req.params.userId}
    `;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// PUT /api/dealership/role/:userId — promote/demote (owner only)
router.put('/role/:userId', ...ownerOnly, async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "admin" or "member"' });
  }
  try {
    const [user] = await sql`
      UPDATE users SET role = ${role}
      WHERE id = ${req.params.userId}
        AND dealership_id = ${req.user.dealershipId}
        AND role != 'owner'
      RETURNING id, email, full_name, role
    `;
    if (!user) return res.status(404).json({ error: 'User not found or is the owner' });
    res.json({ id: user.id, email: user.email, fullName: user.full_name, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// PUT /api/dealership/member/:userId/name — rename any member (owner/admin)
router.put('/member/:userId/name', ...ownerOrAdmin, async (req, res) => {
  const { fullName } = req.body;
  if (!fullName?.trim()) return res.status(400).json({ error: 'Name is required' });
  try {
    const [user] = await sql`
      UPDATE users SET full_name = ${fullName.trim()}
      WHERE id = ${req.params.userId} AND dealership_id = ${req.user.dealershipId}
      RETURNING id, full_name
    `;
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, fullName: user.full_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update name' });
  }
});

// PUT /api/dealership/logo — upload dealership logo (owner/admin)
router.put('/logo', ...ownerOrAdmin, async (req, res) => {
  const { logoData } = req.body;
  if (!logoData) return res.status(400).json({ error: 'logoData is required' });
  if (!logoData.startsWith('data:image/')) return res.status(400).json({ error: 'Invalid image format' });
  // ~750KB base64 limit
  if (logoData.length > 1_000_000) return res.status(400).json({ error: 'Image too large (max ~750KB)' });
  try {
    await sql`UPDATE dealerships SET logo_data = ${logoData} WHERE id = ${req.user.dealershipId}`;
    res.json({ success: true, logoData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save logo' });
  }
});

// DELETE /api/dealership/logo — remove dealership logo (owner/admin)
router.delete('/logo', ...ownerOrAdmin, async (req, res) => {
  try {
    await sql`UPDATE dealerships SET logo_data = NULL WHERE id = ${req.user.dealershipId}`;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove logo' });
  }
});

module.exports = router;
