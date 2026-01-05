# IELTS MCQ Practice App

> A comprehensive IELTS preparation platform with AI-powered insights, gamification, and beautiful glassmorphism UI.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 📝 **One-by-one question delivery** with smooth animations
- ⏱️ **Real-time timer** with pause/resume
- 🎮 **Gamification** - XP, levels, streaks, badges
- 🤖 **AI-powered insights** using GPT-4
- 📊 **Admin dashboard** with analytics
- 🌓 **Dark/Light theme** support
- 📱 **Mobile-first** responsive design
- 🎉 **Celebration animations** on completion

## 🚀 Quick Start

```bash
# Clone repository
git clone <repo-url>
cd ielts-mcq-app

# Install dependencies
yarn install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
yarn db:generate
yarn db:push

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | demo@ielts.com | demo123 |
| Admin | admin@ielts.com | admin123 |

## 📖 Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for:
- Complete setup guide
- VPS deployment instructions
- API reference
- Database schema
- Remaining tasks

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion, GSAP
- **State:** Zustand, React Query
- **Database:** PostgreSQL + Prisma
- **AI:** OpenAI GPT-4
- **Auth:** NextAuth v5 (ready)

## 📁 Project Structure

```
├── app/           # Next.js pages
├── components/    # React components
├── hooks/         # Custom hooks
├── lib/           # Utilities
├── prisma/        # Database schema
└── public/        # Static files
```

## 🔧 Scripts

```bash
yarn dev          # Development server
yarn build        # Production build
yarn start        # Production server
yarn db:generate  # Generate Prisma client
yarn db:push      # Push schema to DB
yarn db:seed      # Seed database
```

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

Built with ❤️ for IELTS aspirants
