# NFC Tap System — Setup & Deployment Guide

## Stack
- **Next.js 14** (App Router) — frontend + backend in one
- **PostgreSQL** — database (Railway plugin)
- **Prisma** — ORM + migrations
- **NextAuth.js** — admin authentication
- **Railway** — hosting
- **GitHub** — source control
- **Resend** — email notifications (optional, free tier)

---

## 1. GitHub Setup

```bash
# In your terminal
git init
git add .
git commit -m "Initial commit — NFC Tap System MVP"
git remote add origin https://github.com/YOUR_USERNAME/nfc-tap-system.git
git push -u origin main
```

---

## 2. Railway Setup

1. Go to [railway.app](https://railway.app) → **New Project**
2. Click **Deploy from GitHub repo** → select `nfc-tap-system`
3. Click **Add Plugin** → choose **PostgreSQL**
4. Railway auto-injects `DATABASE_URL` — done

### Set environment variables in Railway:
```
NEXTAUTH_SECRET     = (generate: openssl rand -base64 32)
NEXTAUTH_URL        = https://YOUR-RAILWAY-DOMAIN.up.railway.app
NEXT_PUBLIC_BASE_URL = https://YOUR-RAILWAY-DOMAIN.up.railway.app
ADMIN_PASSWORD      = (your strong password)
RESEND_API_KEY      = (from resend.com — optional)
LEADS_NOTIFY_EMAIL  = your@email.com
```

### Railway Deploy Command:
In Railway project settings → **Deploy** → set Start Command to:
```
npm run db:migrate && npm run start
```

---

## 3. First Deploy

After Railway deploys:

1. Open Railway shell or run locally with production DB:
```bash
npm run db:seed
```

This creates:
- Admin user: `eswanberg0@gmail.com` / your ADMIN_PASSWORD
- Reps #1–4 with placeholder info
- Tag inventory entries

2. Visit `https://your-domain.com/admin` → log in
3. Edit each rep with real names/phone/email
4. Preview each rep's page at `/r/1`, `/r/2`, `/r/3`, `/r/4`

---

## 4. Custom Domain (Optional but Recommended)

1. Buy a domain (Namecheap, ~$12/yr)
2. In Railway → Settings → Domains → Add Custom Domain
3. Point DNS CNAME to Railway's domain
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` to your domain

---

## 5. Program NFC Tags

### Install "NFC Tools" app (free)
- iOS: search "NFC Tools"
- Android: search "NFC Tools by wakdev"

### For each rep tag:
1. Open NFC Tools → **Write** → **Add a record** → **URL**
2. Enter: `https://yourdomain.com/r/1` (change number per rep)
3. Hold tag to back of phone → Write
4. Test by tapping with a different phone

### Do NOT lock tags until after testing everything end-to-end.

---

## 6. Admin Dashboard Features

| Route | What it does |
|-------|-------------|
| `/admin` | Dashboard: KPIs, leaderboard, recent leads, daily chart |
| `/admin/reps` | List all reps with stats. Preview / Edit each |
| `/admin/reps/new` | Create a rep (maps to a new NFC tag URL) |
| `/admin/reps/[id]` | Edit name, phone, bio, photo, booking link |
| `/admin/leads` | All leads with inline status updates (click to open detail panel) |
| `/admin/analytics` | Tap/view/submit stats by rep, daily chart, 7/14/30/90 day filter |
| `/admin/tags` | Inventory of all registered physical tags |
| `/admin/login` | Sign in page |

---

## 7. Public URLs

| Route | What it is |
|-------|------------|
| `/` | Marketing homepage |
| `/r/1` – `/r/4` | Rep landing pages (NFC destination) |
| `/job/[id]` | Job completion page (Phase 2) |

---

## 8. Rep Landing Page Flow

1. Homeowner taps card → `/r/1` opens instantly
2. Sees rep photo, name, title, bio
3. Can: Call / Text / Email / Save Contact (downloads .vcf)
4. CTA: "Request Free Inspection" → form appears
5. Fills name + phone or email
6. Submit → stored in DB + email sent to you
7. Every step tracked as TAP → VIEW → SUBMIT events

---

## 9. Tracking What You Measure

Check `/admin/analytics` for:
- **Tap count** — how many times each rep's card was tapped
- **Conversion rate** — taps ÷ form submits (target: 20%+)
- **Daily chart** — when are taps happening (morning door knocks?)
- **Per-rep** — who's cards are performing

---

## 10. Week 1 Test Protocol

With 4 reps in the field for 7 days, compare:
- Contact capture rate: NFC vs paper card
- Appointment booking rate per 100 doors
- Conversion rate per tap

If you see even a 10% lift → you have proof to sell this system to other contractors.

---

## Next Features (After MVP)

- [ ] Trade show "Tap to Enter" pages with giveaway
- [ ] Job completion plaque pages (`/job/[id]`)
- [ ] Photo gallery per job
- [ ] QR code fallback (for non-NFC phones)
- [ ] CRM webhook (AccuLynx, Salesforce, HubSpot)
- [ ] Rep leaderboard public page
- [ ] Mobile app for field NFC writing

---

## Running Locally

```bash
# Clone repo
git clone ...
cd nfc-tap-system

# Install dependencies
npm install

# Copy env and fill in values
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Seed database
npm run db:seed

# Start dev server
npm run dev
```

Visit: http://localhost:3000
Admin: http://localhost:3000/admin
