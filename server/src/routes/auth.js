const express = require('express');
const { sql } = require('../db/neon');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function generateAccessCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const l = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const d = Array.from({ length: 4 }, () => digits[Math.floor(Math.random() * digits.length)]).join('');
  return `${l}-${d}`;
}

router.post('/profile', authMiddleware, async (req, res) => {
  const { flow, dealershipName, accessCode, fullName } = req.body;

  if (!flow || !['create', 'join'].includes(flow)) {
    return res.status(400).json({ error: 'flow must be "create" or "join"' });
  }

  try {
    let dealership;

    if (flow === 'create') {
      if (!dealershipName?.trim()) return res.status(400).json({ error: 'Dealership name is required' });

      const [existing] = await sql`
        SELECT id FROM dealerships WHERE LOWER(name) = LOWER(${dealershipName.trim()})
      `;
      if (existing) return res.status(409).json({ error: 'A dealership with that name already exists. Please choose a different name.' });

      let code, attempts = 0;
      while (attempts < 10) {
        code = generateAccessCode();
        const [existingCode] = await sql`SELECT id FROM dealerships WHERE access_code = ${code}`;
        if (!existingCode) break;
        attempts++;
      }
      const [created] = await sql`
        INSERT INTO dealerships (name, access_code) VALUES (${dealershipName.trim()}, ${code}) RETURNING *
      `;
      dealership = created;

      const [user] = await sql`
        INSERT INTO users (auth_user_id, email, full_name, dealership_id, role)
        VALUES (${req.user.authUserId}, ${req.user.email || ''}, ${(fullName || '').trim()}, ${dealership.id}, 'owner')
        ON CONFLICT (auth_user_id) DO UPDATE SET
          full_name = EXCLUDED.full_name, email = EXCLUDED.email,
          dealership_id = EXCLUDED.dealership_id, role = 'owner'
        RETURNING *
      `;

      return res.status(201).json({
        id: user.id, email: user.email, fullName: user.full_name, role: 'owner',
        dealershipId: dealership.id, dealershipName: dealership.name, accessCode: dealership.access_code,
      });
    } else {
      // join — becomes pending until approved
      if (!accessCode?.trim()) return res.status(400).json({ error: 'Access code is required' });

      const [found] = await sql`
        SELECT * FROM dealerships WHERE access_code = ${accessCode.trim().toUpperCase()}
      `;
      if (!found) return res.status(404).json({ error: 'Invalid access code. Check with your dealership admin.' });
      dealership = found;

      const [user] = await sql`
        INSERT INTO users (auth_user_id, email, full_name, dealership_id, role)
        VALUES (${req.user.authUserId}, ${req.user.email || ''}, ${(fullName || '').trim()}, ${dealership.id}, 'pending')
        ON CONFLICT (auth_user_id) DO UPDATE SET
          full_name = EXCLUDED.full_name, email = EXCLUDED.email,
          dealership_id = EXCLUDED.dealership_id, role = 'pending'
        RETURNING *
      `;

      return res.status(201).json({
        id: user.id, email: user.email, fullName: user.full_name, role: 'pending',
        dealershipId: dealership.id, dealershipName: dealership.name,
      });
    }
  } catch (err) {
    console.error('Profile creation error:', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [row] = await sql`
      SELECT u.id, u.auth_user_id, u.email, u.full_name, u.role, u.created_at,
             d.id AS dealership_id, d.name AS dealership_name, d.access_code, d.logo_data
      FROM users u
      LEFT JOIN dealerships d ON d.id = u.dealership_id
      WHERE u.auth_user_id = ${req.user.authUserId}
    `;
    if (!row) return res.status(404).json({ error: 'Profile not found', code: 'PROFILE_MISSING' });

    res.json({
      id: row.id, email: row.email, fullName: row.full_name, role: row.role,
      dealershipId: row.dealership_id, dealershipName: row.dealership_name,
      accessCode: ['owner', 'admin'].includes(row.role) ? row.access_code : undefined,
      logoData: row.logo_data || undefined,
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
