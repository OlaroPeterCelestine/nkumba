# Nkumba registration

Next.js registration form that stores **full name**, **phone**, **email**, and **institution** in PostgreSQL with Prisma.

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Start PostgreSQL with `docker compose up -d`, or use the Homebrew Postgres database named `nkumba`.
3. Apply migrations:

```bash
npx prisma migrate deploy
```

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). After a successful submit, a confirmation modal appears.

## Production

- **GitHub** hosts the source
- **Railway** hosts PostgreSQL
- **Vercel** hosts the Next.js app and uses Railway’s public `DATABASE_URL`
