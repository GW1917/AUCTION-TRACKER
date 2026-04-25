const express = require('express');
const { sql } = require('../db/neon');
const { authMiddleware, ensureProfile } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');

const router = express.Router();
router.use(authMiddleware, ensureProfile);

router.get('/', async (req, res) => {
  try {
    const sites = await sql`
      SELECT id, site_name, site_url, login_id, notes, created_at
      FROM auction_sites
      WHERE user_id = ${req.user.userId}
      ORDER BY created_at DESC
    `;
    res.json(
      sites.map((s) => ({
        id: s.id,
        siteName: s.site_name,
        siteUrl: s.site_url,
        loginId: s.login_id,
        notes: s.notes,
        createdAt: s.created_at,
      }))
    );
  } catch (err) {
    console.error('Get auction sites error:', err);
    res.status(500).json({ error: 'Failed to fetch auction sites' });
  }
});

router.post('/', async (req, res) => {
  const { siteName, siteUrl, loginId, password, notes } = req.body;

  if (!siteName || !siteUrl || !loginId || !password) {
    return res.status(400).json({ error: 'Site name, URL, login ID, and password are required' });
  }

  try {
    const passwordEncrypted = encrypt(password);
    const [site] = await sql`
      INSERT INTO auction_sites (user_id, site_name, site_url, login_id, password_encrypted, notes)
      VALUES (
        ${req.user.userId},
        ${siteName.trim()},
        ${siteUrl.trim()},
        ${loginId.trim()},
        ${passwordEncrypted},
        ${notes ? notes.trim() : null}
      )
      RETURNING id, site_name, site_url, login_id, notes, created_at
    `;
    res.status(201).json({
      id: site.id,
      siteName: site.site_name,
      siteUrl: site.site_url,
      loginId: site.login_id,
      notes: site.notes,
      createdAt: site.created_at,
    });
  } catch (err) {
    console.error('Create auction site error:', err);
    res.status(500).json({ error: 'Failed to create auction site' });
  }
});

router.put('/:id', async (req, res) => {
  const { siteName, siteUrl, loginId, password, notes } = req.body;

  if (!siteName || !siteUrl || !loginId) {
    return res.status(400).json({ error: 'Site name, URL, and login ID are required' });
  }

  try {
    const [existing] = await sql`
      SELECT id FROM auction_sites WHERE id = ${req.params.id} AND user_id = ${req.user.userId}
    `;
    if (!existing) return res.status(404).json({ error: 'Auction site not found' });

    let site;
    if (password) {
      const passwordEncrypted = encrypt(password);
      [site] = await sql`
        UPDATE auction_sites SET
          site_name = ${siteName.trim()},
          site_url = ${siteUrl.trim()},
          login_id = ${loginId.trim()},
          password_encrypted = ${passwordEncrypted},
          notes = ${notes ? notes.trim() : null}
        WHERE id = ${req.params.id} AND user_id = ${req.user.userId}
        RETURNING id, site_name, site_url, login_id, notes, created_at
      `;
    } else {
      [site] = await sql`
        UPDATE auction_sites SET
          site_name = ${siteName.trim()},
          site_url = ${siteUrl.trim()},
          login_id = ${loginId.trim()},
          notes = ${notes ? notes.trim() : null}
        WHERE id = ${req.params.id} AND user_id = ${req.user.userId}
        RETURNING id, site_name, site_url, login_id, notes, created_at
      `;
    }

    res.json({
      id: site.id,
      siteName: site.site_name,
      siteUrl: site.site_url,
      loginId: site.login_id,
      notes: site.notes,
      createdAt: site.created_at,
    });
  } catch (err) {
    console.error('Update auction site error:', err);
    res.status(500).json({ error: 'Failed to update auction site' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await sql`
      DELETE FROM auction_sites
      WHERE id = ${req.params.id} AND user_id = ${req.user.userId}
      RETURNING id
    `;
    if (result.length === 0) return res.status(404).json({ error: 'Auction site not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete auction site error:', err);
    res.status(500).json({ error: 'Failed to delete auction site' });
  }
});

module.exports = router;
