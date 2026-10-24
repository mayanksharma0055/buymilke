# Buyमिलके project notes

- This is a Next.js App Router application using TypeScript, Tailwind CSS, Prisma, and SQLite.
- Use `npm run db:setup` to sync the local schema and seed opportunities; use `npm run dev` to run the app.
- API routes are under `src/app/api`. Keep server-side persistence in Prisma and validate all incoming data.
- Seed prices and savings are illustrative. Do not present them as real offers or add payment claims without a configured provider.
- Membership creation is a demo flow. Do not treat email-only account lookup as production authentication.