# Ranote Exim - Enterprise Import-Export Platform

## 🚀 Production-Ready Features

### ✅ Completed Features

1. **Next.js 14 App Router Architecture**
   - TypeScript configuration
   - TailwindCSS styling
   - Framer Motion animations
   - ShadCN UI components

2. **Premium UI/UX**
   - Futuristic loading screen with animated logo
   - Animated homepage with:
     - Hero section
     - Features showcase
     - How It Works section
     - Animated statistics counters
     - Testimonials
     - Enterprise footer
   - Responsive design
   - Smooth animations and transitions

3. **Complete Authentication System**
   - User registration (Exporter/Importer roles)
   - Login system
   - JWT token-based authentication
   - Password hashing with bcrypt
   - Protected routes with middleware
   - Role-based access control foundation

4. **Production-Grade Database Schema**
   - User management with roles
   - Product catalog system
   - Order management
   - Shipment tracking
   - Messaging system
   - Document management
   - Notification system
   - Full Prisma ORM integration

5. **API Routes**
   - `/api/auth/register` - User registration
   - `/api/auth/login` - User login
   - `/api/auth/me` - Get current user
   - Input validation with Zod
   - Error handling

6. **Security**
   - Environment variable configuration
   - JWT secret management
   - Password encryption
   - SQL injection prevention (Prisma)
   - Input validation

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**
- **Git**

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
cd Ranote_exim_2
```

### 2. Install Dependencies

#### Install Client Dependencies
```bash
cd client
npm install
```

#### Install Server Dependencies (Optional - if using separate backend)
```bash
cd ../server
npm install
```

### 3. Database Setup

#### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ranote_exim_dev;

# Exit
\q
```

#### Configure Environment Variables

In the `client` directory, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ranote_exim_dev"
JWT_SECRET="your-super-secret-key-min-32-characters-long"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Run Database Migrations

```bash
# From the client directory
npx prisma generate
npx prisma db push
```

This will:
- Generate Prisma Client
- Create all database tables based on your schema
- Set up relationships

#### (Optional) Seed Database with Sample Data

```bash
npx prisma db seed
```

### 5. Start the Development Server

```bash
# From the client directory
npm run dev
```

The application will be available at: **http://localhost:3000**

---

## 🎯 Quick Start Guide

### First Run

1. **Access the application**: Open http://localhost:3000
2. **View the homepage**: See the animated loading screen, then the homepage
3. **Create an account**: Click "Get Started" or navigate to `/register`
4. **Choose your role**:
   - **Exporter**: To sell products internationally
   - **Importer**: To buy products from exporters
5. **Complete registration**: Fill in your details
6. **Login**: Use your credentials to access the dashboard

---

## 📂 Project Structure

```
client/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── api/                 # API routes
│   │   └── auth/           # Auth endpoints
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── home/               # Homepage sections
│   ├── ui/                 # Reusable UI components
│   ├── Header.tsx          # Main header
│   ├── Footer.tsx          # Footer
│   └── LoadingScreen.tsx   # Animated loading screen
├── lib/                     # Utility functions
│   ├── auth.ts             # Authentication utilities
│   ├── prisma.ts           # Prisma client
│   ├── utils.ts            # Helper functions
│   └── validations/        # Zod schemas
├── prisma/                  # Database
│   └── schema.prisma       # Database schema
├── public/                  # Static assets
├── middleware.ts            # Route protection
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
└── package.json             # Dependencies

server/                       # Optional Express backend
└── src/
    └── index.ts             # Express server
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `min-32-characters-random-string` |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for file uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST` | Email server host |
| `SMTP_PORT` | Email server port |
| `SMTP_USER` | Email username |
| `SMTP_PASS` | Email password |

---

## 🗄️ Database Schema Overview

### Core Models

1. **User**: User accounts with roles (EXPORTER, IMPORTER, ADMIN)
2. **Product**: Product catalog for exporters
3. **Order**: Purchase orders from importers to exporters
4. **Shipment**: Shipment tracking information
5. **Message**: Internal messaging system
6. **Document**: Document management (licenses, certificates, etc.)
7. **Notification**: User notifications

### Enums

- **Role**: `EXPORTER`, `IMPORTER`, `ADMIN`
- **ProductCategory**: `CHEMICALS`, `MACHINES`, `TEXTILES`, `MEDICAL`, etc.
- **OrderStatus**: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, etc.
- **PaymentStatus**: `PENDING`, `PARTIAL`, `PAID`, `REFUNDED`
- **ShipmentStatus**: `PREPARING`, `IN_TRANSIT`, `CUSTOMS`, `DELIVERED`, etc.
- **DocumentType**: Various document types for compliance

---

## 🚀 Deployment

### Production Environment Setup

1. **Database**: Set up PostgreSQL on your hosting provider
2. **Environment**: Configure production environment variables
3. **Build**: Run `npm run build`
4. **Start**: Run `npm start`

### Recommended Hosting

- **Vercel** (Frontend & API) - Zero configuration
- **Railway** or **Heroku** (PostgreSQL database)
- **AWS** or **DigitalOcean** (Full stack)

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** (min. 32 characters, random)
3. **Enable HTTPS** in production
4. **Set secure cookie options** in production
5. **Implement rate limiting** on authentication routes
6. **Regular security updates** - keep dependencies updated

---

## 🧪 Testing the Application

### Test User Registration

```bash
# Example registration payload
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "EXPORTER",
    "country": "United States",
    "companyName": "Acme Corp"
  }'
```

### Test Login

```bash
# Example login payload
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

---

## 📦 Available Scripts

### Client

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Prisma

```bash
npx prisma studio              # Open Prisma Studio (database GUI)
npx prisma generate            # Generate Prisma Client
npx prisma db push             # Push schema to database
npx prisma migrate dev         # Create and apply migration
npx prisma migrate deploy      # Deploy migrations (production)
```

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -U postgres -h localhost

# Check if database exists
\l

# Check connection string format
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### Port Already in Use

```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

---

## 🎨 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **Framer Motion** - Animations
- **ShadCN UI** - Component library
- **Lucide Icons** - Icon system

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Validation

---

## 📈 Next Steps

### Pending Features (To Be Implemented)

1. **Dashboard Pages**
   - Exporter dashboard with product management
   - Importer dashboard with order management
   - Admin dashboard with system overview

2. **Product Management**
   - Create/edit/delete products
   - Image upload integration
   - Product search and filtering

3. **Order System**
   - Place orders
   - Order tracking
   - Payment integration

4. **Messaging**
   - Real-time chat between users
   - Order-specific messaging

5. **Analytics**
   - Trade statistics
   - Revenue charts
   - User engagement metrics

6. **Advanced Features**
   - Dark mode toggle
   - Email notifications
   - PDF invoice generation
   - Multi-language support
   - Advanced search filters

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@ranoteexim.com

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## ⚡ Performance Optimizations

- Server-side rendering (SSR)
- Image optimization with Next.js Image
- Code splitting
- Lazy loading components
- PostgreSQL connection pooling
- Caching strategies

---

## 🔧 Maintenance

### Regular Tasks

1. **Database Backups**: Schedule regular PostgreSQL backups
2. **Dependency Updates**: Run `npm update` monthly
3. **Security Audits**: Run `npm audit` weekly
4. **Log Monitoring**: Check application and error logs
5. **Performance Monitoring**: Track response times and database queries

---

**Built with ❤️ for Global Trade**
# Renote_Exim
