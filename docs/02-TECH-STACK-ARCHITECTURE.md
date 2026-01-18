# Tech Stack & Architecture

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.15 (App Router)
- **Language**: TypeScript 5.6.3
- **Styling**: Tailwind CSS 3.4.14
- **UI Components**: shadcn/ui (custom components)
- **Animations**: 
  - Framer Motion 11.11.9 (declarative animations)
  - GSAP 3.12.5 (complex animations)
- **Theme**: next-themes 0.4.6 (dark/light mode)

### State Management
- **Client State**: Zustand 5.0.0 (lightweight, flexible)
- **Server State**: React Query 5.59.0 (@tanstack/react-query)
- **Forms**: Native React hooks + validation

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Authentication**: NextAuth v5.0.0-beta.4
- **Database ORM**: Prisma 5.22.0
- **Database**: PostgreSQL 15+
- **Caching**: Redis (ioredis 5.3.0)

### AI & External Services
- **AI**: OpenAI GPT-4 (openai 4.68.1)
- **Payments**: Stripe (future integration)
- **Email**: SMTP (configurable)
- **File Storage**: Local/S3/Cloudinary (configurable)

### PDF & Reporting
- **PDF Generation**: @react-pdf/renderer 3.4.4
- **Charts**: Recharts 2.13.0

### Development Tools
- **Linter**: ESLint 8.57.1
- **Build**: Next.js built-in
- **Package Manager**: npm

## Architecture Patterns

### 1. Multi-Tenant Architecture

#### Data Isolation Strategy
- **Pattern**: Shared Database, Separate Schemas per Tenant (logical isolation)
- **Implementation**: `tenantId` foreign key in all tenant-scoped tables
- **Benefits**:
  - Cost-effective (single database)
  - Centralized maintenance
  - Easier backups and scaling
  
#### Tenant Resolution
```typescript
// Middleware resolves tenant from:
1. Subdomain (preferred): tenant1.app.com
2. Custom domain: tenant1.com → mapped to tenantId
3. Session data: tenantId in JWT
```

### 2. Authentication Architecture

#### NextAuth v5 Flow
```
1. User visits protected route
2. Middleware checks session
3. If no session → redirect to /login
4. User signs in (credentials/OAuth)
5. Callback creates JWT with role + tenantId
6. JWT stored in httpOnly cookie
7. Every request includes session context
```

#### Role Hierarchy
```
SUPER_ADMIN (cross-tenant)
    ↓
  ADMIN (tenant-level)
    ↓
  MANAGER (content + analytics)
    ↓
  TEACHER (content creation)
    ↓
  STUDENT (consumer)
```

### 3. Caching Strategy

#### Multi-Layer Caching
```
1. Redis (L1 Cache)
   - Exam state during attempts
   - Active sessions
   - Rate limit counters
   - Leaderboards

2. React Query (L2 Cache)
   - Client-side data caching
   - Automatic refetching
   - Optimistic updates

3. Next.js Cache (L3 Cache)
   - Static pages
   - API route responses
   - ISR for dynamic content
```

### 4. Database Schema Patterns

#### Soft Deletes
All major entities have `deletedAt` timestamp for soft deletion:
```prisma
deletedAt DateTime?
```

#### Audit Trail
Automatic tracking via `AuditLog` model:
```typescript
- WHO: userId
- WHAT: action (CREATE, UPDATE, DELETE)
- WHEN: createdAt
- WHERE: ipAddress
- CONTEXT: oldValue, newValue
```

#### Versioning
Exams use versioning for change tracking:
```prisma
version Int @default(1)
isLatest Boolean @default(true)
```

### 5. Exam Flow Architecture

#### State Management
```
1. Student starts exam
   ↓
2. Redis lock created (exam:attemptId)
   ↓
3. Questions loaded (shuffled if enabled)
   ↓
4. Each answer synced to Redis instantly
   ↓
5. Telemetry events tracked
   ↓
6. On submit: Redis → PostgreSQL
   ↓
7. Scoring & PDF generation (async)
   ↓
8. Notification sent
```

#### Anti-Cheating System
```typescript
// Telemetry Events Tracked:
- TAB_SWITCH (count, timestamps)
- WINDOW_BLUR (duration)
- COPY_PASTE (attempts)
- RIGHT_CLICK (blocked)
- TIME_ANOMALY (too fast/slow)
- ANSWER_PATTERN (unusual patterns)

// Risk Scoring:
riskScore = Σ(event_weight * event_count)
if riskScore > threshold → FLAGGED
```

### 6. AI Question Generation Flow

```
1. Manager inputs requirements
   ↓
2. Build prompt with templates
   ↓
3. Call OpenAI GPT-4
   ↓
4. Parse & validate response
   ↓
5. Create questions (isApproved=false)
   ↓
6. Log usage & cost
   ↓
7. Manager reviews & edits
   ↓
8. Approve → isApproved=true
```

## Code Organization

### Folder Structure

```
/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx       # Auth layout
│   ├── (student)/           # Student route group
│   │   ├── dashboard/
│   │   ├── courses/
│   │   ├── exams/
│   │   └── layout.tsx       # Student layout
│   ├── (manager)/           # Manager route group
│   │   ├── dashboard/
│   │   ├── question-bank/
│   │   ├── exams/
│   │   └── layout.tsx       # Manager layout
│   ├── (admin)/             # Admin route group
│   │   ├── dashboard/
│   │   ├── tenants/
│   │   ├── users/
│   │   └── layout.tsx       # Admin layout
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── exams/
│   │   ├── questions/
│   │   └── ...
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
│
├── components/              # React components
│   ├── auth/               # Auth forms
│   ├── ui/                 # Base UI components
│   ├── shared/             # Shared components
│   ├── student/            # Student-specific
│   ├── manager/            # Manager-specific
│   └── admin/              # Admin-specific
│
├── lib/                     # Utilities
│   ├── auth.ts             # Auth config
│   ├── prisma.ts           # Prisma client
│   ├── redis.ts            # Redis utilities
│   ├── validations.ts      # Zod schemas
│   ├── utils.ts            # Helpers
│   └── ai/                 # AI utilities
│       └── question-generator.ts
│
├── services/                # Business logic
│   ├── auth.service.ts
│   ├── tenant.service.ts
│   ├── exam.service.ts
│   ├── question.service.ts
│   └── ...
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useTenant.ts
│   ├── useExam.ts
│   └── ...
│
├── types/                   # TypeScript types
│   ├── next-auth.d.ts
│   ├── index.ts
│   └── ...
│
├── prisma/                  # Prisma schema & migrations
│   ├── schema.prisma
│   └── seed.ts
│
├── docs/                    # Documentation
│   ├── 01-PROJECT-SPECIFICATION.md
│   ├── 02-TECH-STACK-ARCHITECTURE.md (this file)
│   └── ...
│
├── public/                  # Static assets
│
├── auth.ts                  # NextAuth config
├── middleware.ts            # Route middleware
├── .env.example             # Environment template
└── package.json
```

## Design Patterns

### 1. Repository Pattern (Services Layer)
```typescript
// services/exam.service.ts
export class ExamService {
  async create(data: CreateExamDto): Promise<Exam>
  async findById(id: string, tenantId: string): Promise<Exam>
  async update(id: string, data: UpdateExamDto): Promise<Exam>
  async delete(id: string): Promise<void>
  async assign(examId: string, assignment: Assignment): Promise<void>
}
```

### 2. Decorator Pattern (HOCs for Auth)
```typescript
export function withAuth(Component, roles: Role[]) {
  return async function AuthenticatedComponent(props) {
    const session = await auth()
    if (!session || !roles.includes(session.user.role)) {
      redirect('/login')
    }
    return <Component {...props} session={session} />
  }
}
```

### 3. Factory Pattern (Question Creators)
```typescript
class QuestionFactory {
  create(type: QuestionType): IQuestion {
    switch(type) {
      case 'MCQ_SINGLE': return new MCQSingleQuestion()
      case 'MCQ_MULTI': return new MCQMultiQuestion()
      case 'TRUE_FALSE': return new TrueFalseQuestion()
      // ...
    }
  }
}
```

### 4. Observer Pattern (Real-time Updates)
```typescript
// Redis Pub/Sub for live exam monitoring
redis.publish('exam:updates', {
  examId,
  event: 'answer_submitted',
  data: { /* ... */ }
})
```

## Performance Optimizations

### 1. Database
- Indexes on high-query fields (tenantId, userId, createdAt)
- Pagination for list queries
- Connection pooling (Prisma default)
- Query optimization (select only needed fields)

### 2. Caching
- Redis for hot data (sessions, exam state)
- React Query for API responses
- Static generation for landing pages
- ISR for content pages

### 3. Frontend
- Code splitting (Next.js automatic)
- Lazy loading for heavy components
- Image optimization (next/image)
- Font optimization (next/font)
- Tree shaking

### 4. API Routes
- Edge runtime where possible
- Response streaming for large data
- Compression (gzip/brotli)
- Rate limiting (Redis-based)

## Security Best Practices

### 1. Authentication
- Bcrypt for password hashing (salt rounds: 10)
- HttpOnly cookies for JWT
- CSRF protection (NextAuth built-in)
- Session expiry (7 days max)

### 2. Authorization
- Role-based access control (RBAC)
- Tenant-scoped queries (always filter by tenantId)
- API route guards
- Middleware protection

### 3. Input Validation
- Zod schemas for all inputs
- SQL injection prevention (Prisma)
- XSS protection (React auto-escaping)
- File upload validation

### 4. Data Protection
- Soft deletes (preserve history)
- Audit logging (all mutations)
- Encryption at rest (PostgreSQL)
- Encryption in transit (HTTPS)

## Scalability Considerations

### Horizontal Scaling
- Stateless API (JWT-based auth)
- Redis for shared state
- Load balancer ready
- Database read replicas

### Vertical Scaling
- PostgreSQL connection pooling
- Redis memory management
- Next.js build optimization
- CDN for static assets

### Multi-Region
- Database replication
- Redis sentinel/cluster
- CDN edge locations
- Geolocation-based routing

## Monitoring & Observability

### Logging
- Structured logging (JSON format)
- Winston/Pino for server logs
- Client-side error tracking
- Audit logs for compliance

### Metrics
- Request latency
- Error rates
- Cache hit rates
- Database query times

### Alerts
- Uptime monitoring
- Error thresholds
- Performance degradation
- Security incidents

## Future Enhancements

See [06-FUTURE-ENHANCEMENTS.md](./06-FUTURE-ENHANCEMENTS.md)
