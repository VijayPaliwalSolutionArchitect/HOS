# IELTS MCQ Practice App - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Feature Status](#feature-status)
4. [Project Structure](#project-structure)
5. [Environment Variables](#environment-variables)
6. [Local Development Setup](#local-development-setup)
7. [VPS Deployment Guide](#vps-deployment-guide)
8. [Database Setup](#database-setup)
9. [Authentication Setup](#authentication-setup)
10. [API Routes Reference](#api-routes-reference)
11. [Remaining Tasks](#remaining-tasks)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

IELTS MCQ Practice is a comprehensive web application designed to help students prepare for the IELTS exam through interactive multiple-choice quizzes. The platform features gamification elements, AI-powered insights, real-time progress tracking, and a modern glassmorphism UI design.

### Key Highlights
- **One-by-one question delivery** with smooth animations
- **Real-time timer** with pause/resume functionality
- **Gamification** - XP points, levels, streaks, badges
- **AI-powered insights** using OpenAI GPT-4
- **Admin dashboard** with analytics
- **Dark/Light theme** support
- **Mobile-first** responsive design
- **PWA-ready** configuration

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 14.2.15 |
| Language | TypeScript | 5.6.3 |
| Styling | Tailwind CSS | 3.4.14 |
| Animation | Framer Motion | 11.11.9 |
| Animation | GSAP | 3.12.5 |
| State Management | Zustand | 5.0.0 |
| Server State | React Query | 5.59.0 |
| Database ORM | Prisma | 5.22.0 |
| Database | PostgreSQL | 15+ |
| AI | OpenAI GPT-4 | Latest |
| PDF Generation | @react-pdf/renderer | 3.4.4 |
| Charts | Recharts | 2.13.0 |
| Icons | Lucide React | 0.453.0 |
| Notifications | React Hot Toast | 2.4.1 |
| Gestures | React Swipeable | 7.0.1 |
| Confetti | Canvas Confetti | 1.9.3 |

---

## Feature Status

### ✅ COMPLETED Features

#### Core Quiz System
| Feature | Status | File Location |
|---------|--------|---------------|
| One-by-one question display | ✅ Done | `/app/quiz/[slug]/page.tsx` |
| Multiple choice options | ✅ Done | `/components/quiz/question-card.tsx` |
| True/False questions | ✅ Done | `/components/quiz/option-button.tsx` |
| Timer with countdown | ✅ Done | `/components/quiz/timer.tsx` |
| Pause/Resume functionality | ✅ Done | `/hooks/useTimer.ts` |
| Question navigation (prev/next) | ✅ Done | `/app/quiz/[slug]/page.tsx` |
| Question dots navigator | ✅ Done | `/components/quiz/progress-bar.tsx` |
| Flag for review | ✅ Done | `/hooks/useQuiz.ts` |
| Keyboard shortcuts | ✅ Done | `/app/quiz/[slug]/page.tsx` |
| Swipe gestures (mobile) | ✅ Done | `/app/quiz/[slug]/page.tsx` |
| Quiz completion & scoring | ✅ Done | `/app/quiz/[slug]/page.tsx` |
| Confetti celebration | ✅ Done | `/components/animations/confetti-canvas.tsx` |

#### User Interface
| Feature | Status | File Location |
|---------|--------|---------------|
| Landing page | ✅ Done | `/app/page.tsx` |
| Login page | ✅ Done | `/app/login/page.tsx` |
| Registration page | ✅ Done | `/app/register/page.tsx` |
| User dashboard | ✅ Done | `/app/dashboard/page.tsx` |
| Quiz sets listing | ✅ Done | `/app/quiz/sets/page.tsx` |
| Profile page | ✅ Done | `/app/profile/page.tsx` |
| Settings page | ✅ Done | `/app/settings/page.tsx` |
| Leaderboard | ✅ Done | `/app/leaderboard/page.tsx` |
| Dark/Light theme | ✅ Done | `/components/shared/theme-toggle.tsx` |
| Glassmorphism design | ✅ Done | `/app/globals.css` |
| Responsive navbar | ✅ Done | `/components/shared/navbar.tsx` |
| Footer | ✅ Done | `/components/shared/footer.tsx` |

#### Admin Dashboard
| Feature | Status | File Location |
|---------|--------|---------------|
| Admin dashboard overview | ✅ Done | `/app/admin/page.tsx` |
| Quiz sets management | ✅ Done | `/app/admin/sets/page.tsx` |
| Users management | ✅ Done | `/app/admin/users/page.tsx` |
| Analytics charts | ✅ Done | `/app/admin/page.tsx` |

#### Gamification
| Feature | Status | File Location |
|---------|--------|---------------|
| XP points system | ✅ Done | `/lib/auth.ts` |
| Level progression | ✅ Done | `/lib/utils.ts` |
| Streak tracking | ✅ Done | `/lib/auth.ts` |
| Badges display | ✅ Done | `/lib/mock-data.ts` |
| Achievements display | ✅ Done | `/lib/mock-data.ts` |

#### Technical
| Feature | Status | File Location |
|---------|--------|---------------|
| Prisma schema | ✅ Done | `/prisma/schema.prisma` |
| Validation schemas | ✅ Done | `/lib/validations.ts` |
| Utility functions | ✅ Done | `/lib/utils.ts` |
| OpenAI integration | ✅ Done | `/lib/ai.ts` |
| PDF template | ✅ Done | `/lib/pdf.tsx` |
| Mock data | ✅ Done | `/lib/mock-data.ts` |

---

### ⏳ REMAINING Features (Need Implementation)

#### High Priority
| Feature | Difficulty | Time Est. | How to Implement |
|---------|------------|-----------|------------------|
| Real PostgreSQL connection | Easy | 1 hour | See [Database Setup](#database-setup) section |
| NextAuth v5 integration | Medium | 3 hours | See [Authentication Setup](#authentication-setup) section |
| API routes for CRUD | Medium | 4 hours | Create `/app/api/*` routes |
| Real-time data fetching | Medium | 2 hours | Replace mock data with API calls |

#### Medium Priority
| Feature | Difficulty | Time Est. | How to Implement |
|---------|------------|-----------|------------------|
| PDF download functionality | Easy | 1 hour | Use `@react-pdf/renderer` client-side |
| AI insights generation | Easy | 1 hour | Call `/api/ai/insights` endpoint |
| Question explanations | Easy | 30 min | Add to result review modal |
| Socket.IO real-time leaderboard | Hard | 4 hours | Set up Socket.IO server |
| Email notifications | Medium | 2 hours | Integrate Resend/SendGrid |

#### Low Priority
| Feature | Difficulty | Time Est. | How to Implement |
|---------|------------|-----------|------------------|
| PWA offline support | Medium | 2 hours | Configure service worker |
| Audio questions support | Easy | 1 hour | Add audio player to QuestionCard |
| Image questions support | Easy | 30 min | Already supported, add images to data |
| Social sharing | Easy | 30 min | Add share buttons to results |
| Google OAuth | Medium | 2 hours | Configure NextAuth Google provider |

---

## Project Structure

```
/app/ielts-mcq-app/
├── app/                          # Next.js App Router
│   ├── globals.css               # Global styles + Tailwind
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   ├── loading.tsx               # Global loading state
│   ├── error.tsx                 # Global error boundary
│   ├── providers.tsx             # React Query + Theme providers
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── register/
│   │   └── page.tsx              # Registration page
│   ├── dashboard/
│   │   └── page.tsx              # User dashboard
│   ├── quiz/
│   │   ├── sets/
│   │   │   └── page.tsx          # Quiz sets listing
│   │   └── [slug]/
│   │       └── page.tsx          # Quiz taking interface
│   ├── leaderboard/
│   │   └── page.tsx              # Leaderboard page
│   ├── profile/
│   │   └── page.tsx              # User profile
│   ├── settings/
│   │   └── page.tsx              # User settings
│   ├── admin/
│   │   ├── layout.tsx            # Admin layout
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── sets/
│   │   │   └── page.tsx          # Quiz sets management
│   │   └── users/
│   │       └── page.tsx          # Users management
│   └── api/                      # API routes (TO BE CREATED)
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts      # NextAuth handler
│       ├── quiz/
│       │   ├── route.ts          # GET/POST quiz sets
│       │   └── [id]/
│       │       └── route.ts      # GET/PUT/DELETE quiz
│       ├── questions/
│       │   └── route.ts          # Questions CRUD
│       ├── attempts/
│       │   └── route.ts          # Quiz attempts
│       └── ai/
│           └── insights/
│               └── route.ts      # AI insights generation
│
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   └── index.ts
│   ├── quiz/                     # Quiz-specific components
│   │   ├── question-card.tsx
│   │   ├── option-button.tsx
│   │   ├── timer.tsx
│   │   ├── progress-bar.tsx
│   │   ├── results-timeline.tsx
│   │   └── index.ts
│   ├── animations/               # Animation components
│   │   ├── glass-card.tsx
│   │   ├── score-ring.tsx
│   │   ├── confetti-canvas.tsx
│   │   ├── motion-timeline.tsx
│   │   └── index.ts
│   ├── shared/                   # Shared layout components
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── theme-toggle.tsx
│   │   └── index.ts
│   └── auth/                     # Auth components
│       ├── login-form.tsx
│       ├── register-form.tsx
│       └── index.ts
│
├── hooks/                        # Custom React hooks
│   ├── useQuiz.ts                # Quiz state management (Zustand)
│   ├── useTimer.ts               # Timer logic
│   ├── useConfetti.ts            # Confetti animations
│   ├── useAuth.ts                # Authentication hook
│   └── index.ts
│
├── lib/                          # Utilities and services
│   ├── utils.ts                  # Helper functions
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # Mock auth (replace with NextAuth)
│   ├── ai.ts                     # OpenAI integration
│   ├── pdf.tsx                   # PDF generation template
│   ├── validations.ts            # Zod schemas
│   └── mock-data.ts              # Sample data
│
├── prisma/
│   └── schema.prisma             # Database schema
│
├── public/
│   └── manifest.json             # PWA manifest
│
├── .env.local                    # Environment variables
├── .env.example                  # Environment template
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.mjs               # Next.js configuration
└── postcss.config.mjs            # PostCSS configuration
```

---

## Environment Variables

### `.env.local` (Development)

```env
# ===========================================
# IELTS MCQ App - Environment Variables
# ===========================================

# ==========================================
# DATABASE
# ==========================================
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ielts_mcq?schema=public"

# ==========================================
# AUTHENTICATION (NextAuth v5)
# ==========================================
# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-key-generate-with-openssl"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional)
# Get from: https://console.cloud.google.com/apis/credentials
# GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ==========================================
# AI INTEGRATION
# ==========================================
# OpenAI API Key (or Emergent LLM Key)
# The app is configured to use Emergent's API endpoint
OPENAI_API_KEY="sk-emergent-your-key-here"

# ==========================================
# APP CONFIGURATION
# ==========================================
NEXT_PUBLIC_APP_NAME="IELTS MCQ Practice"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ==========================================
# EMAIL (Optional - for notifications)
# ==========================================
# RESEND_API_KEY="re_your_resend_api_key"
# EMAIL_FROM="noreply@yourdomain.com"

# ==========================================
# REDIS (Optional - for real-time features)
# ==========================================
# REDIS_URL="redis://localhost:6379"
```

### `.env.production` (Production)

```env
# ===========================================
# PRODUCTION ENVIRONMENT
# ===========================================

# Database (Use connection pooling for production)
DATABASE_URL="postgresql://user:password@your-db-host:5432/ielts_mcq?schema=public&connection_limit=20"

# Authentication
NEXTAUTH_SECRET="production-secret-key-very-long-and-random"
NEXTAUTH_URL="https://yourdomain.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-secret"

# AI
OPENAI_API_KEY="sk-your-production-api-key"

# App
NEXT_PUBLIC_APP_NAME="IELTS MCQ Practice"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- PostgreSQL 15+
- Yarn (recommended) or npm
- Git

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd ielts-mcq-app

# 2. Install dependencies
yarn install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Set up PostgreSQL database
# Option A: Using Docker
docker run --name ielts-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ielts_mcq \
  -p 5432:5432 \
  -d postgres:15

# Option B: Local PostgreSQL
# Create database: createdb ielts_mcq

# 5. Generate Prisma client and push schema
yarn db:generate
yarn db:push

# 6. (Optional) Seed the database
yarn db:seed

# 7. Start development server
yarn dev

# App will be available at http://localhost:3000
```

### Available Scripts

```bash
yarn dev          # Start development server (port 3000)
yarn build        # Create production build
yarn start        # Start production server
yarn lint         # Run ESLint
yarn db:generate  # Generate Prisma client
yarn db:push      # Push schema to database
yarn db:seed      # Seed database with sample data
```

---

## VPS Deployment Guide

### Option 1: Traditional VPS (Ubuntu/Debian)

#### Server Requirements
- Ubuntu 22.04 LTS or Debian 12
- 2GB RAM minimum (4GB recommended)
- 20GB SSD storage
- Node.js 18+ installed
- PostgreSQL 15+ installed
- Nginx for reverse proxy
- PM2 for process management

#### Step-by-Step Deployment

```bash
# ==========================================
# 1. SERVER SETUP
# ==========================================

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Yarn
npm install -g yarn

# Install PM2
npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# ==========================================
# 2. DATABASE SETUP
# ==========================================

# Create PostgreSQL user and database
sudo -u postgres psql

# In PostgreSQL shell:
CREATE USER ielts_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE ielts_mcq OWNER ielts_user;
GRANT ALL PRIVILEGES ON DATABASE ielts_mcq TO ielts_user;
\q

# ==========================================
# 3. APPLICATION DEPLOYMENT
# ==========================================

# Create app directory
sudo mkdir -p /var/www/ielts-mcq
sudo chown -R $USER:$USER /var/www/ielts-mcq

# Clone repository
cd /var/www/ielts-mcq
git clone <your-repo-url> .

# Install dependencies
yarn install

# Create production environment file
cp .env.example .env.local
nano .env.local  # Edit with production values

# Generate Prisma client and migrate
yarn db:generate
yarn db:push

# Build application
yarn build

# ==========================================
# 4. PM2 CONFIGURATION
# ==========================================

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ielts-mcq',
    script: 'yarn',
    args: 'start',
    cwd: '/var/www/ielts-mcq',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions

# ==========================================
# 5. NGINX CONFIGURATION
# ==========================================

sudo nano /etc/nginx/sites-available/ielts-mcq

# Paste this configuration:
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ielts-mcq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# ==========================================
# 6. SSL CERTIFICATE (Let's Encrypt)
# ==========================================

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

### Option 2: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ielts_mcq
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=ielts_mcq
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

```bash
# Deploy with Docker Compose
docker-compose up -d --build
```

### Option 3: Vercel Deployment (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# Project Settings > Environment Variables
```

---

## Database Setup

### Prisma Schema Overview

The database schema includes:
- **User** - User accounts with gamification fields
- **Account** - OAuth accounts (for NextAuth)
- **Session** - User sessions
- **QuizSet** - Quiz collections
- **Question** - Individual questions
- **Attempt** - Quiz attempts
- **Answer** - Individual answers
- **Result** - Generated results with AI insights
- **Badge** - Collectible badges
- **Achievement** - Progress-based achievements

### Migration Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name init

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Seed Database

Create `/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ielts.com' },
    update: {},
    create: {
      email: 'admin@ielts.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      xpPoints: 5000,
      level: 15,
    },
  });

  // Create sample quiz set
  const quizSet = await prisma.quizSet.create({
    data: {
      title: 'IELTS Reading Practice - Academic',
      slug: 'ielts-reading-academic-1',
      description: 'Comprehensive reading practice with academic texts.',
      topic: 'READING',
      difficulty: 'MEDIUM',
      duration: 20,
      totalQuestions: 10,
      passScore: 60,
      active: true,
      featured: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            order: 1,
            text: 'The author\'s main purpose in writing this passage is to:',
            type: 'SINGLE_CHOICE',
            timeLimit: 60,
            difficulty: 'MEDIUM',
            options: [
              { id: 'a', text: 'Describe the history', isCorrect: false },
              { id: 'b', text: 'Explain the effects', isCorrect: true },
              { id: 'c', text: 'Argue against', isCorrect: false },
              { id: 'd', text: 'Compare methods', isCorrect: false },
            ],
            explanation: 'The passage primarily discusses effects.',
          },
          // Add more questions...
        ],
      },
    },
  });

  // Create badges
  const badges = await prisma.badge.createMany({
    data: [
      { name: 'First Steps', description: 'Complete your first quiz', icon: '🌟', rarity: 'COMMON', xpReward: 50 },
      { name: 'Quick Learner', description: 'Answer 10 correctly in a row', icon: '⚡', rarity: 'RARE', xpReward: 100 },
      { name: 'Perfectionist', description: 'Score 100% on any quiz', icon: '🏆', rarity: 'EPIC', xpReward: 200 },
    ],
  });

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Authentication Setup

### Current Mock System

The app currently uses a mock authentication system in `/lib/auth.ts`. This is designed for easy replacement with NextAuth v5.

### NextAuth v5 Implementation

#### 1. Install NextAuth

```bash
yarn add next-auth@beta @auth/prisma-adapter
```

#### 2. Create Auth Configuration

Create `/lib/auth-config.ts`:

```typescript
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    // Email/Password
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
```

#### 3. Create API Route

Create `/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from '@/lib/auth-config';

export const { GET, POST } = handlers;
```

#### 4. Update useAuth Hook

Replace `/hooks/useAuth.ts`:

```typescript
import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin: session?.user?.role === 'ADMIN',
    signIn: (email: string, password: string) =>
      signIn('credentials', { email, password, redirect: false }),
    signOut: () => signOut({ callbackUrl: '/' }),
  };
}
```

#### 5. Update Providers

Update `/app/providers.tsx`:

```typescript
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
```

---

## API Routes Reference

### To Be Created API Endpoints

```typescript
// Quiz Sets
GET    /api/quiz          - List all quiz sets
POST   /api/quiz          - Create quiz set (admin)
GET    /api/quiz/[id]     - Get quiz set details
PUT    /api/quiz/[id]     - Update quiz set (admin)
DELETE /api/quiz/[id]     - Delete quiz set (admin)

// Questions
GET    /api/questions          - List questions
POST   /api/questions          - Create question (admin)
PUT    /api/questions/[id]     - Update question (admin)
DELETE /api/questions/[id]     - Delete question (admin)

// Attempts
POST   /api/attempts           - Start quiz attempt
PUT    /api/attempts/[id]      - Update attempt (submit answers)
GET    /api/attempts/[id]      - Get attempt details

// AI Insights
POST   /api/ai/insights        - Generate AI insights
POST   /api/ai/explanation     - Get question explanation

// Users (Admin)
GET    /api/users              - List users (admin)
PUT    /api/users/[id]         - Update user (admin)
DELETE /api/users/[id]         - Delete user (admin)

// Profile
GET    /api/profile            - Get current user profile
PUT    /api/profile            - Update profile

// Leaderboard
GET    /api/leaderboard        - Get leaderboard
```

### Example API Route Implementation

`/app/api/quiz/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-config';

// GET /api/quiz - List all quiz sets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');

    const quizSets = await prisma.quizSet.findMany({
      where: {
        active: true,
        ...(topic && { topic: topic as any }),
        ...(difficulty && { difficulty: difficulty as any }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json(quizSets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch quiz sets' },
      { status: 500 }
    );
  }
}

// POST /api/quiz - Create quiz set (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const quizSet = await prisma.quizSet.create({
      data: {
        ...body,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(quizSet, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create quiz set' },
      { status: 500 }
    );
  }
}
```

---

## Remaining Tasks

### Phase 1: Database Integration (Priority: HIGH)

**Time Estimate: 4-6 hours**

1. [ ] Set up PostgreSQL database
2. [ ] Configure DATABASE_URL in .env
3. [ ] Run `prisma db push` to create tables
4. [ ] Create seed script for initial data
5. [ ] Replace mock data imports with Prisma queries

### Phase 2: Authentication (Priority: HIGH)

**Time Estimate: 3-4 hours**

1. [ ] Install next-auth@beta and @auth/prisma-adapter
2. [ ] Create `/lib/auth-config.ts`
3. [ ] Create `/app/api/auth/[...nextauth]/route.ts`
4. [ ] Update `useAuth` hook
5. [ ] Update Providers with SessionProvider
6. [ ] Test login/register flows
7. [ ] (Optional) Add Google OAuth

### Phase 3: API Routes (Priority: HIGH)

**Time Estimate: 6-8 hours**

1. [ ] Create `/api/quiz` routes
2. [ ] Create `/api/questions` routes
3. [ ] Create `/api/attempts` routes
4. [ ] Create `/api/profile` routes
5. [ ] Create `/api/leaderboard` route
6. [ ] Add authentication middleware
7. [ ] Add validation with Zod

### Phase 4: Data Fetching (Priority: MEDIUM)

**Time Estimate: 3-4 hours**

1. [ ] Create React Query hooks for each API
2. [ ] Replace mock data in pages with API calls
3. [ ] Add loading states
4. [ ] Add error handling
5. [ ] Implement optimistic updates

### Phase 5: AI Integration (Priority: MEDIUM)

**Time Estimate: 2-3 hours**

1. [ ] Create `/api/ai/insights` route
2. [ ] Create `/api/ai/explanation` route
3. [ ] Add insights to result page
4. [ ] Test with Emergent LLM key

### Phase 6: PDF Generation (Priority: LOW)

**Time Estimate: 1-2 hours**

1. [ ] Create PDF download button on results page
2. [ ] Generate PDF client-side using @react-pdf/renderer
3. [ ] Add print styles

### Phase 7: Polish & Testing (Priority: MEDIUM)

**Time Estimate: 4-6 hours**

1. [ ] Add loading skeletons
2. [ ] Improve error messages
3. [ ] Add form validation feedback
4. [ ] Mobile responsiveness testing
5. [ ] Performance optimization
6. [ ] SEO meta tags
7. [ ] Analytics integration

---

## Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: Can't reach database server at `localhost`:`5432`
```
**Solution:** Ensure PostgreSQL is running and DATABASE_URL is correct.

#### Prisma Client Not Generated
```
Error: @prisma/client did not initialize yet
```
**Solution:** Run `yarn db:generate` to generate the Prisma client.

#### Build Fails with Type Errors
```
Type error: Cannot find module '@/lib/auth'
```
**Solution:** Check `tsconfig.json` paths configuration and ensure all imports are correct.

#### NextAuth Session Not Persisting
**Solution:** Ensure `NEXTAUTH_SECRET` is set and consistent across deployments.

#### Styles Not Loading in Production
**Solution:** Ensure Tailwind config includes all file paths in `content` array.

### Getting Help

- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **NextAuth Docs:** https://authjs.dev
- **Tailwind Docs:** https://tailwindcss.com/docs

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | demo@ielts.com | demo123 |
| Admin | admin@ielts.com | admin123 |

---

## License

MIT License - See LICENSE file for details.

---

**Last Updated:** January 2025
**Version:** 1.0.0
