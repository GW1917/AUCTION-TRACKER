require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { neon } = require('@neondatabase/serverless');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('❌  DATABASE_URL is not set in .env');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  console.log('\n🔧  Running Auction Tracker database migrations...\n');

  try {
    // Users — keyed by Neon Auth (Better Auth) user ID
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auth_user_id     TEXT UNIQUE NOT NULL,
        email            TEXT NOT NULL,
        dealership_name  TEXT NOT NULL,
        full_name        TEXT NOT NULL DEFAULT '',
        created_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('  ✅  users');

    await sql`
      CREATE TABLE IF NOT EXISTS auction_sites (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
        site_name           TEXT NOT NULL,
        site_url            TEXT NOT NULL,
        login_id            TEXT NOT NULL,
        password_encrypted  TEXT NOT NULL,
        notes               TEXT,
        created_at          TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('  ✅  auction_sites');

    await sql`
      CREATE TABLE IF NOT EXISTS saved_searches (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
        search_name  TEXT NOT NULL,
        filters_json JSONB NOT NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('  ✅  saved_searches');

    console.log('\n🎉  All migrations complete!\n');
  } catch (err) {
    console.error('\n❌  Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
