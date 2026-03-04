@echo off
echo ========================================
echo Ranote Exim - Setup Script (Windows)
echo ========================================
echo.

cd client

echo [1/4] Installing dependencies...
call npm install
echo.

echo [2/4] Generating Prisma Client...
call npx prisma generate
echo.

echo [3/4] Fixing Supabase cross-schema FK...
echo ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey_auth; | call npx prisma db execute --stdin --schema prisma/schema.prisma
echo.

echo [4/4] Pushing database schema to Supabase...
call npx prisma db push --accept-data-loss
echo.

echo ========================================
echo Setup complete!
echo ========================================
echo.
echo The .env.local file with Supabase + DB credentials
echo is already included in the repo.
echo.
echo Run 'npm run dev' to start the development server
echo Open http://localhost:3000 in your browser
echo.
pause
