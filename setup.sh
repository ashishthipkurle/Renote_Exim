#!/bin/bash

echo "Ranote Exim - Setup Script"
echo "===================================="
echo ""

# Navigate to client directory
cd client || exit

# Install dependencies
echo "[1/4] Installing dependencies..."
npm install

# Generate Prisma Client
echo ""
echo "[2/4] Generating Prisma Client..."
npx prisma generate

# Fix Supabase cross-schema FK
echo ""
echo "[3/4] Fixing Supabase cross-schema FK..."
echo 'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey_auth;' | npx prisma db execute --stdin --schema prisma/schema.prisma

# Push database schema
echo ""
echo "[4/4] Pushing database schema to Supabase..."
npx prisma db push --accept-data-loss

echo ""
echo "===================================="
echo "Setup complete!"
echo "===================================="
echo ""
echo "The .env.local file with Supabase + DB credentials"
echo "is already included in the repo."
echo ""
echo "Run 'npm run dev' to start the development server"
echo "Open http://localhost:3000 in your browser"
