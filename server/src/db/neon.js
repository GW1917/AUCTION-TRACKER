const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set. Add it to your .env file.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

module.exports = { sql };
