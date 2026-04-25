# Auction Tracker

**Professional multi-auction vehicle search for car dealerships.**

Search Manheim, ADESA, OVE.com, BacklotCars, ACV Auctions, TradeRev, and SmartAuction simultaneously with a single search — filtered by year, make, model, mileage, condition rating, color, and radius.

Built with React + TypeScript + Tailwind CSS on the frontend and Node.js + Express + Neon (serverless PostgreSQL) on the backend.

---

## Screenshots

> Dark luxury dashboard with gold accents. Vehicle cards display photo, VIN, mileage, condition stars, distance, and a direct "View on [Site]" link.

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend  | Node.js + Express |
| Database | Neon (serverless PostgreSQL) via `@neondatabase/serverless` |
| Auth     | Custom JWT auth stored in Neon (bcryptjs + jsonwebtoken) |
| Styling  | Playfair Display + DM Sans + Glass-morphism design system |

---

## Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free tier is fine)

---

## Neon Console Setup

1. Go to [console.neon.tech](https://console.neon.tech) and create a new project called **auction-tracker**.
2. After creation, click **Connection Details** and copy the **Connection string** — it looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. You'll paste this into your `.env` file as `DATABASE_URL`.

### Optional: Neon Auth (Stack Auth)

Neon Auth is an integrated auth solution powered by [Stack Auth](https://stack-auth.com). To enable it:

1. In the Neon Console, go to your project → **Integrations** → **Auth**.
2. Enable Stack Auth and copy the `STACK_SECRET_SERVER_KEY` and `NEXT_PUBLIC_STACK_PROJECT_ID`.
3. Add these to your `.env`:
   ```
   NEON_AUTH_SECRET=your-stack-secret-server-key
   ```
4. For full Stack Auth integration in a non-Next.js app, follow the [Stack Auth docs](https://docs.stack-auth.com) for React + Node setup.

> This project ships with a self-contained JWT auth system that stores users in Neon. The `NEON_AUTH_SECRET` env var is reserved for future Stack Auth integration.

---

## Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
DATABASE_URL=postgresql://...   # Your Neon connection string
JWT_SECRET=your-32-char-secret  # Random string — keep this secret
ENCRYPTION_KEY=your-32-char-key # For encrypting auction site passwords
PORT=5000
NODE_ENV=development
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run this twice — once for `JWT_SECRET`, once for `ENCRYPTION_KEY`.

---

## Installation

```bash
# From the project root — installs all dependencies
npm run install:all
```

Or manually:
```bash
npm install
cd client && npm install
cd ../server && npm install
```

---

## Database Migration

Run this **once** to create the database tables:

```bash
npm run migrate
```

Or directly:
```bash
node server/src/db/migrate.js
```

This creates three tables: `users`, `auction_sites`, and `saved_searches`.

---

## Development

```bash
npm run dev
```

This starts both servers concurrently:
- **Client** → http://localhost:5173 (Vite dev server)
- **Server** → http://localhost:5000 (Express API)

Vite proxies all `/api/*` requests to the Express server, so you develop against a single origin.

---

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit — Auction Tracker"
git remote add origin https://github.com/YOUR_USERNAME/auction-tracker.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your GitHub username.

---

## Adding Real Auction Connectors

Each auction site has a connector in `server/src/connectors/`. They currently return **mock data** — realistic but not live.

To connect a real auction site:

1. Open the relevant file, e.g. `server/src/connectors/manheim.js`
2. Replace the `search()` function body with your real implementation:
   - **API-based sites**: Authenticate with the site's API, receive a token, and query their inventory endpoint.
   - **Browser-based sites**: Use [Puppeteer](https://pptr.dev) or [Playwright](https://playwright.dev) to automate login and scrape search results.

```js
async function search(credentials, filters) {
  // Example: API-based
  const { loginId, password } = credentials;
  const tokenRes = await axios.post('https://api.manheim.com/auth', { loginId, password });
  const { token } = tokenRes.data;

  const results = await axios.get('https://api.manheim.com/inventory/search', {
    headers: { Authorization: `Bearer ${token}` },
    params: { make: filters.make, model: filters.model, ... },
  });

  return results.data.vehicles.map(v => ({
    id: v.id,
    vin: v.vin,
    year: v.year,
    make: v.make,
    // ...map to the standard Listing schema
  }));
}
```

**Important:** Always check the auction site's Terms of Service before automating access. Many sites offer official dealer API programs.

---

## Project Structure

```
auction-tracker/
├── client/                     # React + TypeScript frontend
│   ├── src/
│   │   ├── components/         # Shared UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── context/            # React context (AuthContext)
│   │   ├── types/              # TypeScript interfaces
│   │   ├── api.ts              # Axios client with auth interceptor
│   │   └── index.css           # Global styles + design system
│   └── tailwind.config.js      # Custom design tokens
│
├── server/                     # Node.js + Express API
│   ├── server.js               # Express entry point
│   └── src/
│       ├── routes/             # API route handlers
│       ├── middleware/         # JWT auth middleware
│       ├── connectors/         # One file per auction site
│       ├── db/                 # Neon connection + migration
│       └── utils/              # Encryption, filter helpers
│
├── .env.example                # Environment variable template
├── .gitignore
└── package.json                # Root — concurrently scripts
```

---

## API Reference

| Method | Endpoint                  | Auth | Description |
|--------|--------------------------|------|-------------|
| POST   | /api/auth/register        | —    | Register new dealer account |
| POST   | /api/auth/login           | —    | Login, receive JWT |
| GET    | /api/user/profile         | ✓    | Get current user profile |
| GET    | /api/auction-sites        | ✓    | List saved auction sites |
| POST   | /api/auction-sites        | ✓    | Add new auction site |
| PUT    | /api/auction-sites/:id    | ✓    | Update auction site |
| DELETE | /api/auction-sites/:id    | ✓    | Remove auction site |
| POST   | /api/search               | ✓    | Run multi-site vehicle search |
| GET    | /api/saved-searches       | ✓    | List saved searches |
| POST   | /api/saved-searches       | ✓    | Save a search configuration |
| DELETE | /api/saved-searches/:id   | ✓    | Delete a saved search |

---

## Security Notes

- `.env` is in `.gitignore` — **never commit it**
- Auction site passwords are AES-256-CBC encrypted before being stored in Neon
- Passwords are never returned through any API response
- JWTs expire after 8 hours
- bcrypt cost factor 12 for password hashing
- CORS is restricted to the configured client origin in production

---

## License

MIT — built for dealer use. Integrate responsibly.
