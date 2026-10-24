# Buyमिलके

A full-stack preview of a subscription car-buying platform. Customers discover monthly buying groups, register interest in a car, and view their groups and demo membership in My garage.

## Run locally

Requirements: Node.js 20.9 or later, npm, and PostgreSQL. The hosted app uses Neon PostgreSQL.

```powershell
npm install
npx vercel env pull .env
npm run db:setup
npm run dev
```

Open `http://localhost:3000`. `npm run db:setup` syncs the PostgreSQL schema and seeds four sample opportunities. Re-running it updates the sample cars and groups without deleting customer requests. Keep the pulled `.env` private and never commit it.

For a different PostgreSQL provider, copy `.env.example` to `.env` and use that provider's connection string.

## API

- `GET /api/opportunities` returns open opportunities, car details, and current group counts.
- `POST /api/requests` registers interest. Required JSON fields: `opportunityId`, `name`, `email`, `phone`, and `city`. Duplicate requests for the same opportunity and email return `409`.
- `GET /api/requests` returns only the current browser session's requests. Email is not used as authentication.
- `POST /api/subscriptions` creates a demo membership. Required JSON fields: `name`, `email`, `phone`, and optional `plan` (`monthly` or `annual`).
- `GET /api/subscriptions` returns the current browser session's membership summary.
- `DELETE /api/session` clears the current browser session cookie.

All records are persisted in PostgreSQL. Input validation, duplicate handling, and API error responses are included. Customer records are scoped to a random browser session token; only the token hash is stored.

## Important preview limits

Car images, prices, savings, and group sizes are illustrative seed data, not manufacturer or dealer offers. A group joining the preview does not guarantee a discount or vehicle availability. Membership records are marked `DEMO_ACTIVE`; no subscription payment is collected. There is no identity verification, email/OTP login, payment gateway, dealer/manufacturer integration, or negotiation workflow in this preview. Browser-session access is not verified identity or production authentication. Add real authentication, privacy/legal terms, verified pricing, and payment integrations before accepting real customers or payments.

## Checks

```powershell
npm run lint
npm run build
```