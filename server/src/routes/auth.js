// Auth routes — sign-in/sign-up are handled entirely by Neon Auth (Better Auth)
// on the client. This file only handles post-auth profile creation/lookup.

const express = require('express');
const { sql } = require('../db/neon');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Called after sign-up to save dealership name.
router.post('/profile', authMiddleware, async (req, res) => {
  const { dealershipName, fullName } = req.body;

  if (!dealershipName?.trim()) {
    return res.status(400).json({ error: 'Dealership name is required' });
  }

  try {
    const [user] = await sql`
      INSERT INTO users (auth_user_id, email, dealership_name, full_name)
      VALUES (
        ${req.user.authUserId},
        ${req.user.email || ''},
        ${dealershipName.trim()},
        ${(fullName || '').trim()}
      )
      ON CONFLICT (auth_user_id) DO UPDATE SET
        dealership_name = EXCLUDED.dealership_name,
        full_name       = EXCLUDED.full_name,
        email           = EXCLUDED.email
      RETURNING id, auth_user_id, email, dealership_name, full_name, created_at
    `;

    res.status(201).json({
      id: user.id,
      email: user.email,
      dealershipName: user.dealership_name,
      fullName: user.full_name,
    });
  } catch (err) {
    console.error('Profile creation error:', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Returns the profile for the authenticated user.
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [user] = await sql`
      SELECT id, auth_user_id, email, dealership_name, full_name, created_at
      FROM users WHERE auth_user_id = ${req.user.authUserId}
    `;

    if (!user) {
      return res.status(404).json({ error: 'Profile not found', code: 'PROFILE_MISSING' });
    }

    res.json({
      id: user.id,
      email: user.email,
      dealershipName: user.dealership_name,
      fullName: user.full_name,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
