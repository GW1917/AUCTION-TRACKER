const express = require('express');
const { sql } = require('../db/neon');
const { authMiddleware, ensureProfile } = require('../middleware/auth');
const { decrypt } = require('../utils/encryption');

const router = express.Router();
router.use(authMiddleware, ensureProfile);

const connectors = {
  manheim:      require('../connectors/manheim'),
  adesa:        require('../connectors/adesa'),
  ove:          require('../connectors/ove'),
  backlotcars:  require('../connectors/backlotcars'),
  acv:          require('../connectors/acv'),
  traderev:     require('../connectors/traderev'),
  smartauction: require('../connectors/smartauction'),
};

function resolveConnector(siteName) {
  const name = siteName.toLowerCase().replace(/[\s.\-_]/g, '');
  if (name.includes('manheim'))   return 'manheim';
  if (name.includes('adesa'))     return 'adesa';
  if (name.includes('ove'))       return 'ove';
  if (name.includes('backlot'))   return 'backlotcars';
  if (name.includes('acv'))       return 'acv';
  if (name.includes('traderev'))  return 'traderev';
  if (name.includes('smart'))     return 'smartauction';
  return null;
}

router.post('/', async (req, res) => {
  const { filters, selectedSiteIds } = req.body;

  if (!filters || !selectedSiteIds?.length) {
    return res.status(400).json({ error: 'Filters and at least one auction site are required' });
  }

  try {
    const sites = await sql`
      SELECT id, site_name, login_id, password_encrypted
      FROM auction_sites
      WHERE user_id = ${req.user.userId} AND id = ANY(${selectedSiteIds})
    `;

    if (sites.length === 0) {
      return res.status(400).json({ error: 'No valid auction sites found' });
    }

    const searches = sites.map((site) => {
      const key = resolveConnector(site.site_name);
      const connector = key ? connectors[key] : connectors.manheim;

      let password = '';
      try { password = decrypt(site.password_encrypted); } catch { /* ignore */ }

      return connector
        .search({ loginId: site.login_id, password }, filters)
        .then((results) =>
          results.map((r) => ({ ...r, auctionSiteId: site.id, auctionSiteName: site.site_name }))
        )
        .catch((err) => {
          console.error(`Connector error [${site.site_name}]:`, err.message);
          return [];
        });
    });

    const listings = (await Promise.all(searches)).flat();
    res.json({ listings, total: listings.length, sitesSearched: sites.length });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed. Please try again.' });
  }
});

module.exports = router;
