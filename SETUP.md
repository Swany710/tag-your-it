# NFC Tap System - Setup and Deployment Guide

## Stack
- Next.js 14 (App Router)
- PostgreSQL on Railway
- Prisma ORM
- NextAuth.js for admin login
- Resend for optional lead notifications

---

## Railway deployment

1. Create a new Railway project from this GitHub repository.
2. Add the PostgreSQL plugin to the project.
3. Set these Railway environment variables:

```bash
DATABASE_URL=<provided by Railway Postgres>
NEXTAUTH_SECRET=<generate a long random string>
NEXTAUTH_URL=https://YOUR-RAILWAY-DOMAIN.up.railway.app
NEXT_PUBLIC_BASE_URL=https://YOUR-RAILWAY-DOMAIN.up.railway.app
ADMIN_PASSWORD=<your admin password>
RESEND_API_KEY=<optional>
LEADS_NOTIFY_EMAIL=<optional>
```

4. Leave the deploy commands to the repository configuration in `railway.toml`.

Railway will run this automatically on deploy:
- `npm run db:setup`
- `npm run start`

`db:setup` does two things:
- pushes the Prisma schema to the Railway Postgres database
- seeds the app with the admin user, 25 rep slots, and 25 NFC tag inventory records

---

## First deploy result

After the first successful Railway deploy, the app will contain:
- Admin user: `eswanberg0@gmail.com`
- Admin password: whatever you set in `ADMIN_PASSWORD`
- 25 rep slots with IDs `1` through `25`
- 25 NFC tag inventory records tied to those rep slots

The 25 rep slots are seeded as placeholders and start inactive until you assign them.

---

## Admin workflow

1. Visit `/admin/login`
2. Sign in with `eswanberg0@gmail.com` and your `ADMIN_PASSWORD`
3. Open `/admin/reps` to see all 25 rep slots
4. Use `/admin/reps/new` to assign one of the 25 fixed slots, or edit an existing slot from the reps list
5. Activate the rep and test the public NFC landing page

Each rep slot maps directly to a public URL:
- `/r/1`
- `/r/2`
- ...
- `/r/25`

---

## NFC tag programming

For each physical NFC tag:
1. Open your NFC writing app
2. Write the matching URL for that rep slot, such as `https://yourdomain.com/r/7`
3. Test the tag before locking it

Do not lock tags until the full flow works end to end.

---

## Local development

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Open:
- `http://localhost:3000`
- `http://localhost:3000/admin/login`

---

## Notes

- This project is intentionally using `prisma db push` for deployment right now, not `prisma migrate deploy`.
- If you later want a migration-based production flow, add committed Prisma migrations first, then switch Railway over to `prisma migrate deploy`.
- The application only supports 25 fixed rep slots for the admin tracking workflow.
