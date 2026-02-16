@echo off
echo ========================================
echo Ranote Exim - Quick Setup Script (Windows)
echo ========================================
echo.

cd client

echo Installing dependencies...
call npm install

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo WARNING: Please edit .env with your database credentials
    echo.
)

echo Generating Prisma Client...
call npx prisma generate

set /p SETUP_DB="Do you want to push the schema to the database now? (y/n): "
if /i "%SETUP_DB%"=="y" (
    echo Setting up database...
    call npx prisma db push
    echo Database schema created!
) else (
    echo Skipping database setup
    echo Run 'npx prisma db push' when ready
)

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit client\.env with your database credentials
echo 2. Run 'npx prisma db push' to create database tables
echo 3. Run 'npm run dev' to start the development server
echo 4. Open http://localhost:3000 in your browser
echo.
echo Happy trading!
pause
