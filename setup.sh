#!/bin/bash

echo "🚀 Ranote Exim - Quick Setup Script"
echo "===================================="
echo ""

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL and try again"
    exit 1
fi

echo "✅ PostgreSQL found"
echo ""

# Navigate to client directory
cd client || exit

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your database credentials"
    echo ""
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Push database schema
echo "🗄️  Setting up database..."
read -p "Do you want to push the schema to the database now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma db push
    echo "✅ Database schema created"
else
    echo "⏭️  Skipping database setup"
    echo "Run 'npx prisma db push' when ready"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit client/.env with your database credentials"
echo "2. Run 'npx prisma db push' to create database tables"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Happy trading! 🌍"
