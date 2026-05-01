# 🍔 Yumm - Food Delivery Platform

A modern, full-stack food delivery platform built with Next.js, PostgreSQL, and Tailwind CSS. Deploy on Vercel with zero friction.

## 🚀 Tech Stack

- **Frontend:** React + Next.js 14 (TypeScript)
- **Backend:** Next.js API Routes (Node.js)
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS + Custom Components
- **Deployment:** Vercel (Zero-config)
- **Auth:** JWT + bcryptjs

## 📋 Project Structure

```
yumm/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/
│   │   │   ├── restaurants/
│   │   │   ├── orders/
│   │   │   └── health/
│   │   ├── components/             # Reusable UI Components
│   │   ├── lib/                    # Utilities & Helpers
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Home Page
│   │   └── globals.css
│   └── middleware.ts               # Auth middleware (optional)
├── prisma/
│   └── schema.prisma              # Database Schema
├── public/                         # Static Assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
└── .env.local.example
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ or use Supabase (PostgreSQL-as-a-Service)
- Git

### 1. Clone & Install

```bash
git clone <repo>
cd yumm
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL and start the service
# Create database
createdb yumm_db

# Create .env.local
cp .env.local.example .env.local

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/yumm_db"
```

#### Option B: Supabase (Recommended for Vercel)
1. Go to [supabase.com](https://supabase.com)
2. Create project → Copy PostgreSQL connection string
3. Update `.env.local` with your Supabase URL

### 3. Prisma Setup

```bash
# Push schema to database
npm run db:push

# Optional: Open Prisma Studio to browse data
npm run db:studio
```

### 4. Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy on Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit: Next.js food delivery app"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → Import your GitHub repo
3. Configure environment variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: https://your-domain.vercel.app

### 3. Deploy
- Click "Deploy" → Vercel automatically builds and deploys
- Your app is live! 🎉

## 📚 API Documentation

### Health Check
```bash
GET /api/health
```

### Authentication
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## 🎨 Tailwind CSS Customization

Colors are defined in `tailwind.config.ts`:
- `primary`: #FF6B35 (Orange)
- `secondary`: #004E89 (Blue)
- `accent`: #F7B801 (Yellow)
- `success`: #2A9D8F (Teal)
- `danger`: #E76F51 (Red)

Custom components available in `src/app/globals.css`:
- `.btn-primary`, `.btn-secondary`, `.btn-outline`
- `.card`, `.input`, `.badge`

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - Use `.env.local.example` as template
2. **Store secrets in Vercel dashboard** - Not in .env
3. **Use Prisma for queries** - Prevents SQL injection
4. **Hash passwords** - bcryptjs is pre-configured
5. **Validate all inputs** - Especially from API calls

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `@prisma/client` | Database ORM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT tokens |
| `tailwindcss` | CSS framework |
| `typescript` | Type safety |

## 🚀 Next Steps

1. **Implement authentication pages** (Login, Register)
2. **Build restaurant listing** with search & filters
3. **Create menu & ordering system**
4. **Add order tracking**
5. **Implement payment gateway** (Stripe)
6. **Setup email notifications** (SendGrid)
7. **Add admin dashboard**

## 📞 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@yumm.app

## 📄 License

MIT License - Feel free to use for personal and commercial projects.

---

**Happy Coding! 🚀**
