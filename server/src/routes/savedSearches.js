const express = require('express');
const { sql } = require('../db/neon');
const { authMiddleware, ensureProfile } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware, ensureProfile);

router.get('/', async (req, res) => {
  try {
    const searches = await sql`
      SELECT id, search_name, filters_json, created_at
      FROM saved_searches
      WHERE user_id = ${req.user.userId}
      ORDER BY created_at DESC
    `;
    res.json(
      searches.map((s) => ({
        id: s.id,
        searchName: s.search_name,
        filters: s.filters_json,
        createdAt: s.created_at,
      }))
    );
  } catch (err) {
    console.error('Get saved searches error:', err);
    res.status(500).json({ error: 'Failed to fetch saved searches' });
  }
});

router.post('/', async (req, res) => {
  const { searchName, filters } = req.body;

  if (!searchName || !filters) {
    return res.status(400).json({ error: 'Search name and filters are required' });
  }

  try {
    const [search] = await sql`
      INSERT INTO saved_searches (user_id, search_name, filters_json)
      VALUES (${req.user.userId}, ${searchName.trim()}, ${JSON.stringify(filters)})
      RETURNING id, search_name, filters_json, created_at
    `;
    res.status(201).json({
      id: search.id,
      searchName: search.search_name,
      filters: search.filters_json,
      createdAt: search.created_at,
    });
  } catch (err) {
    console.error('Create saved search error:', err);
    res.status(500).json({ error: 'Failed to save search' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await sql`
      DELETE FROM saved_searches
      WHERE id = ${req.params.id} AND user_id = ${req.user.userId}
      RETURNING id
    `;
    if (result.length === 0) return res.status(404).json({ error: 'Saved search not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete saved search error:', err);
    res.status(500).json({ error: 'Failed to delete saved search' });
  }
});

module.exports = router;
