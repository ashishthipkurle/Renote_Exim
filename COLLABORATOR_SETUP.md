# Collaborator Setup Guide

## Quick Start (3 commands)

```bash
# 1. Clone the repo (or pull latest main)
git clone <repo-url>
cd Ranote_exim_2

# 2. Install dependencies + set up database
cd client
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:3000** in your browser. Everything should work — the database credentials are already included in the repo.

---

## What's Already Configured

| Component | Status | Details |
|-----------|--------|---------|
| Supabase Auth | Ready | Credentials in `client/.env.local` |
| Supabase Postgres DB | Ready | Connection string in `client/.env.local` |
| Prisma ORM | Auto-generated | Runs on `npm install` via `postinstall` script |
| Database Schema | Synced | Tables are already created in Supabase |

---

## If You Get Database Errors

If Prisma gives connection errors, run:

```bash
cd client
npx prisma generate    # regenerate the Prisma client
npx prisma db push     # sync schema to database
```

Or use the setup script from the root:

```bash
# Windows
setup.bat

# Mac/Linux
chmod +x setup.sh && ./setup.sh
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (from `client/`) |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:push` | Push schema changes to database |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run setup` | Full setup: install + generate + push |

---

## Working on a New Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

cd client
npm install          # in case new packages were added
npm run dev          # start developing
```

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Auth**: Supabase Auth (email/password)
- **Database**: Supabase PostgreSQL via Prisma ORM
- **Deployment**: Netlify

---

## Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
cd client && npx prisma generate
```

### "Connection refused" or "Database connection error"
The DATABASE_URL in `.env.local` connects to our shared Supabase Postgres instance. Make sure you're connected to the internet.

### "Table does not exist"
```bash
cd client && npx prisma db push
```

### API routes returning 500 errors
Check the terminal running `npm run dev` for error logs. Most likely a missing Prisma client — run `npx prisma generate`.
