require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const auctionSitesRoutes = require('./src/routes/auctionSites');
const searchRoutes = require('./src/routes/search');
const savedSearchesRoutes = require('./src/routes/savedSearches');
const dealershipRoutes = require('./src/routes/dealership');

const app = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? [
      process.env.CLIENT_URL,
      'https://stunning-essence-production-e22d.up.railway.app',
    ].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auction-sites', auctionSitesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/saved-searches', savedSearchesRoutes);
app.use('/api/dealership', dealershipRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚗  Auction Tracker API running on port ${PORT}`);
  console.log(`    Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
