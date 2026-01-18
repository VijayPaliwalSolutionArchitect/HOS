# Multi-Tenant EdTech SaaS Platform - Project Specification

## 1. Overview

This is a comprehensive, enterprise-grade, multi-tenant Online Education & Examination SaaS Platform built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## 2. Core Concepts

### 2.1 Multi-Tenancy
- **Tenant Isolation**: Each organization (school, institution, company) is a separate tenant
- **Shared Database**: Single database with tenant-based data isolation
- **Tenant Resolution**: Automatic tenant detection via subdomain or domain
- **Data Security**: Row-level security ensuring complete data isolation

### 2.2 User Roles & Permissions

#### STUDENT
- Access courses and materials
- Take exams and practice tests
- View results and progress
- Earn badges and achievements
- View leaderboard

#### TEACHER
- Create and manage courses
- Create questions and quizzes
- View student progress
- Grade submissions (future)

#### MANAGER
- All Teacher permissions
- Manage question bank
- Create and assign exams
- View analytics and reports
- Approve AI-generated content
- Monitor live exams
- Access audit logs

#### ADMIN
- All Manager permissions
- Manage users within tenant
- Configure tenant settings
- Manage subscriptions
- Send notifications
- View system health

#### SUPER_ADMIN
- Cross-tenant administration
- Manage all tenants
- System configuration
- Global analytics
- AI settings

## 3. Core Features

### 3.1 Course Management
- Hierarchical categories
- Rich course content (videos, PDFs, notes)
- Course modules with sequential learning
- Difficulty levels
- Tags and search
- Published/draft status

### 3.2 Question Bank
- Multiple question types:
  - Single choice MCQ
  - Multiple choice MCQ
  - True/False
  - Fill in the blank
  - Case-based questions
- Question metadata:
  - Difficulty (1-5 scale)
  - Marks and negative marking
  - Time limits
  - Tags for organization
  - Media attachments (images, audio, video)
  - Explanations
- AI-generated questions with approval workflow
- Question analytics (attempt count, correct rate, avg time)

### 3.3 Exam System
- **Exam Configuration**:
  - Duration, marks, passing criteria
  - Question selection (manual or category-based)
  - Rules (shuffle, show results, allow review)
  - Scheduling (start/end times)
  
- **Exam Assignment**:
  - Assign to individual users
  - Assign to groups or classes
  - Set attempt limits
  
- **Exam Attempt**:
  - Redis-based state locking
  - Real-time answer syncing
  - Progress saving
  - Anti-cheating telemetry
  
- **Results**:
  - Automatic scoring
  - PDF generation
  - AI-powered insights
  - Shareable results
  - Email delivery

### 3.4 Anti-Cheating System
- Tab switch detection
- Window blur tracking
- Copy/paste detection
- Right-click prevention
- Time anomaly analysis
- Answer pattern analysis
- Risk scoring algorithm
- Configurable thresholds

### 3.5 Gamification
- **XP System**:
  - Earn XP for completing exams
  - Level progression
  - XP multipliers for difficulty
  
- **Streaks**:
  - Daily activity tracking
  - Longest streak records
  
- **Badges**:
  - Collectible achievements
  - Rarity levels (Common, Rare, Epic, Legendary)
  - XP rewards
  
- **Achievements**:
  - Progress-based goals
  - Categories (Practice, Streak, Score, Social, Milestone)
  - Unlock criteria

### 3.6 Analytics & Reporting
- Student performance dashboards
- Question difficulty analysis
- Exam success rates
- Time spent analytics
- Category-wise performance
- Cohort comparisons
- Export capabilities

### 3.7 Notifications
- Exam assignments
- Exam reminders
- Result publication
- Achievement unlocks
- System announcements
- In-app + Email delivery

### 3.8 Subscription & Billing
- **Plans**:
  - FREE: Limited users, questions, exams
  - PRO: Increased limits, basic features
  - INSTITUTION: Higher limits, advanced features
  - ENTERPRISE: Custom limits, all features
  
- **Limits**:
  - Max users
  - Max questions
  - Max exams
  - AI credits
  - Storage quota
  
- **Stripe Integration**:
  - Subscription management
  - Payment processing
  - Webhook handling
  - Invoice generation

### 3.9 Audit Logging
- User actions tracking
- Entity changes (create, update, delete)
- Old and new values
- IP address and user agent
- Timestamp tracking
- Searchable audit trail

### 3.10 AI Augmentation
- **Question Generation**:
  - Subject and topic-based
  - Difficulty customization
  - Exam type specificity
  - Bulk generation
  - Quality scoring
  
- **Approval Workflow**:
  - Manager review required
  - Edit before approval
  - Rejection with feedback
  
- **Cost Tracking**:
  - Token usage logging
  - Cost per generation
  - Budget limits
  - Usage analytics

## 4. Technical Architecture

### 4.1 Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion, GSAP
- **State Management**: Zustand, React Query
- **Authentication**: NextAuth v5
- **Database**: PostgreSQL + Prisma ORM
- **Caching**: Redis (ioredis)
- **AI**: OpenAI GPT-4
- **Payments**: Stripe
- **PDF**: @react-pdf/renderer

### 4.2 Folder Structure
```
app/
├── (auth)/           # Authentication pages
├── (student)/        # Student role pages
├── (manager)/        # Manager role pages
├── (admin)/          # Admin role pages
├── api/              # API routes
├── layout.tsx
└── page.tsx

components/
├── auth/
├── ui/
├── shared/
└── [role-specific]/

lib/
├── auth.ts
├── redis.ts
├── prisma.ts
├── validations.ts
└── ai/

services/
├── auth.service.ts
├── tenant.service.ts
├── exam.service.ts
└── ...

prisma/
├── schema.prisma
└── seed.ts

docs/
├── 01-PROJECT-SPECIFICATION.md (this file)
├── 02-TECH-STACK-ARCHITECTURE.md
├── 03-AUTHENTICATION-GUIDE.md
├── 04-AI-AUGMENTATION-GUIDE.md
├── 05-DEPLOYMENT-GUIDE.md
├── 06-FUTURE-ENHANCEMENTS.md
└── 07-API-REFERENCE.md
```

## 5. Data Flow Examples

### 5.1 Student Takes Exam
1. Student selects exam from dashboard
2. System checks assignment and attempts
3. Redis lock created for attempt
4. Questions loaded (shuffled if configured)
5. Answers synced to Redis in real-time
6. Telemetry events tracked
7. On completion, Redis data persisted to DB
8. Automatic scoring applied
9. PDF generated asynchronously
10. Notification sent

### 5.2 Manager Creates Exam
1. Manager navigates to exam builder
2. Selects questions from bank or categories
3. Configures rules and scheduling
4. Saves draft or publishes
5. Assigns to users/groups
6. Notifications sent to assigned users

### 5.3 AI Question Generation
1. Manager inputs subject, topic, difficulty
2. Request sent to OpenAI with prompt template
3. Response parsed and validated
4. Questions created with isApproved=false
5. Manager reviews and edits
6. Approval marks questions for use
7. Usage logged with token count and cost

## 6. Security Considerations

### 6.1 Multi-Tenant Security
- Tenant ID in every query
- No cross-tenant data access
- Middleware tenant validation
- Audit logging for all actions

### 6.2 Authentication & Authorization
- Secure password hashing (bcrypt)
- JWT with role and tenant claims
- Route-level role guards
- API endpoint protection

### 6.3 Exam Security
- Redis-based attempt locking
- Telemetry for suspicious behavior
- Risk scoring algorithm
- IP and device tracking

### 6.4 Data Protection
- Input validation (Zod schemas)
- SQL injection prevention (Prisma)
- XSS protection
- CSRF tokens
- Rate limiting

## 7. Performance Optimization

- Redis caching for sessions and exam state
- Database indexing on high-query fields
- Pagination on list views
- Lazy loading for media
- CDN for static assets
- Image optimization
- Code splitting

## 8. Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators
- Semantic HTML

## 9. Future Enhancements

See [06-FUTURE-ENHANCEMENTS.md](./06-FUTURE-ENHANCEMENTS.md) for:
- Mobile apps (iOS/Android)
- Advanced proctoring (webcam, screen recording)
- White-label theming
- Marketplace for courses
- Live classes integration
- Advanced analytics
- Custom workflows
