# Nkumba registration

Next.js registration form that stores **full name**, **phone**, **email**, and **institution** in PostgreSQL with Prisma.

Email and phone numbers are unique, so the same person cannot register twice.

## Live

- Form: https://nkumba-rho.vercel.app
- QR code: https://nkumba-rho.vercel.app/qr
- Manager login: https://nkumba-rho.vercel.app/manager
- Dashboard: https://nkumba-rho.vercel.app/admin
- GitHub: https://github.com/OlaroPeterCelestine/nkumba
- Railway Postgres: `nkumba` in the **bbs** workspace

The QR code is at the top of the public form and also at `/qr`. Sign in at `/manager` to view registrations at `/admin`.

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Start PostgreSQL with `docker compose up -d`, or use a local Postgres database named `nkumba`.
3. Apply migrations:

```bash
npx prisma migrate deploy
```

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). After a successful submit, a confirmation modal appears.
