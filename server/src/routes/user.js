const express = require('express');
const { sql } = require('../db/neon');
const { authMiddleware, ensureProfile } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authMiddleware, ensureProfile, async (req, res) => {
  try {
    const [user] = await sql`
      SELECT id, email, dealership_name, full_name, created_at
      FROM users WHERE id = ${req.user.userId}
    `;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      dealershipName: user.dealership_name,
      fullName: user.full_name,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
