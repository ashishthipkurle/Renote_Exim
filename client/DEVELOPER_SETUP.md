# Developer Setup Guide

Welcome to the Ranote Exim Platform. Follow these steps to set up your local development environment and ensure the database is synchronized.

## Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Nhost account (if testing authentication locally)

## Step-by-Step Initialization

### 1. Environment Variables
Copy the example environment file and fill in your local database credentials:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` matches your local PostgreSQL instance.

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Synchronization
Run the following command to apply all migrations and generate the Prisma client:
```bash
npx prisma migrate dev
```
*Note: If Prisma detects drift, it will ask to create a new migration. Give it a descriptive name like `sync_latest_schema`.*

### 4. Seed Initial Data
To populate your database with sample users and products:
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

## Troubleshooting

- **Enum Mismatch**: If you see errors related to `ProductCategory`, ensure you are using Title-Case (e.g., `Machines`) instead of UPPERCASE.
- **Migration Drift**: If the database is out of sync with `schema.prisma`, run `npx prisma db push` only as a last resort, as it may bypass migration history. `prisma migrate dev` is the preferred method for maintaining history.

---
*Maintained by the Ranote Exim Core Team*
