# Multi-Tenant EdTech SaaS Platform

> A comprehensive, enterprise-grade, multi-tenant Online Education & Examination SaaS Platform built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🏢 Multi-Tenancy
- Complete tenant isolation with shared database
- Subdomain and custom domain support
- Tenant-specific settings and branding
- Row-level security

### 👥 Role-Based Access Control
- **SUPER_ADMIN**: Cross-tenant administration
- **ADMIN**: Tenant-level management
- **MANAGER**: Content creation and analytics
- **TEACHER**: Course and question creation
- **STUDENT**: Learning and assessments

### 📚 Course Management
- Hierarchical categories
- Rich course content (videos, PDFs, notes)
- Course modules with sequential learning
- Progress tracking

### ❓ Question Bank
- Multiple question types (MCQ, True/False, Fill-in-blank, Case-based)
- AI-powered question generation (GPT-4)
- Approval workflow for AI content
- Question analytics and difficulty calibration
- Media attachments (images, audio, video)

### 📝 Exam System
- Flexible exam configuration
- Assignment to users/groups/classes
- Redis-based state locking
- Real-time answer syncing
- Anti-cheating telemetry
- Automatic scoring and PDF generation
- AI-powered insights

### 🔐 Authentication & Security
- NextAuth v5 with Credentials and Google OAuth
- JWT-based session management
- Role-based route protection
- Audit logging for compliance
- Rate limiting

### 🎮 Gamification
- XP points and level progression
- Daily streaks
- Badges with rarity levels
- Achievements and milestones
- Leaderboards

### 📊 Analytics & Reporting
- Student performance dashboards
- Question difficulty analysis
- Exam success rates
- Time spent analytics
- Export capabilities

### 🤖 AI Augmentation
- Intelligent question generation
- Cost tracking and budget controls
- Quality scoring
- Prompt engineering templates

### 💳 Subscription & Billing
- Multiple plans (FREE, PRO, INSTITUTION, ENTERPRISE)
- Configurable limits per plan
- Stripe integration ready

## 🚀 Quick Start

```bash
# Clone repository
git clone <repo-url>
cd HOS

# Install dependencies
npm install --legacy-peer-deps

# Set up environment
cp .env.example .env
# Edit .env with your values (DATABASE_URL, REDIS_URL, AUTH_SECRET, etc.)

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with demo data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |
| Manager | manager@demo.com | demo123 |
| Teacher | teacher@demo.com | demo123 |
| Student | student@demo.com | demo123 |

## 📖 Documentation

Comprehensive documentation available in `docs/`:

- **[01-PROJECT-SPECIFICATION.md](./docs/01-PROJECT-SPECIFICATION.md)** - Complete platform specification
- **[02-TECH-STACK-ARCHITECTURE.md](./docs/02-TECH-STACK-ARCHITECTURE.md)** - Technical architecture and patterns
- **[03-AUTHENTICATION-GUIDE.md](./docs/03-AUTHENTICATION-GUIDE.md)** - NextAuth v5 setup guide
- **[04-AI-AUGMENTATION-GUIDE.md](./docs/04-AI-AUGMENTATION-GUIDE.md)** - AI question generation guide
- **[05-DEPLOYMENT-GUIDE.md](./docs/05-DEPLOYMENT-GUIDE.md)** - Production deployment instructions

## 🛠️ Tech Stack

- **Framework:** Next.js 14.2.15 (App Router)
- **Language:** TypeScript 5.6.3
- **Styling:** Tailwind CSS 3.4.14
- **Animation:** Framer Motion 11.11.9, GSAP 3.12.5
- **State:** Zustand 5.0.0, React Query 5.59.0
- **Database:** PostgreSQL + Prisma 5.22.0
- **Caching:** Redis (ioredis 5.3.0)
- **AI:** OpenAI GPT-4
- **Auth:** NextAuth v5.0.0-beta.4
- **PDF:** @react-pdf/renderer 3.4.4
- **Charts:** Recharts 2.13.0

## 📁 Project Structure

```
├── app/                  # Next.js App Router
│   ├── (auth)/          # Authentication pages
│   ├── (student)/       # Student dashboard and features
│   ├── (manager)/       # Manager content management
│   ├── (admin)/         # Admin system management
│   └── api/             # API routes
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── ui/             # Base UI components
│   └── shared/         # Shared components
├── lib/                 # Utilities
│   ├── redis.ts        # Redis utilities
│   ├── prisma.ts       # Prisma client
│   └── ai/             # AI utilities
├── services/            # Business logic layer
├── prisma/             # Database schema and migrations
│   ├── schema.prisma   # Multi-tenant schema
│   └── seed.ts         # Seed script
├── docs/               # Documentation
├── types/              # TypeScript types
├── auth.ts             # NextAuth configuration
├── middleware.ts       # Route protection
└── public/             # Static files
```

## 🔧 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB
npm run db:seed      # Seed database with demo data
```

## 🌟 Key Differentiators

- **True Multi-Tenancy**: Complete data isolation with shared infrastructure
- **AI-Powered**: Intelligent question generation with quality control
- **Enterprise-Ready**: Audit logging, role-based access, subscription management
- **Anti-Cheating**: Comprehensive telemetry and risk scoring
- **Scalable**: Redis caching, connection pooling, optimized queries
- **Modern Stack**: Latest Next.js 14, TypeScript, Prisma, NextAuth v5

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

Built with ❤️ for IELTS aspirants
