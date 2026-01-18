# HOS - Hospital Operating System / IELTS MCQ App

Complete EdTech SaaS Platform with FastAPI backend and React frontend.

## 🚀 Features Implemented

### Backend (FastAPI + MongoDB)

#### Core Features
- ✅ **Multi-tenant Architecture** - Full tenant isolation with subscription management
- ✅ **JWT Authentication** - Access & refresh tokens with role-based access control
- ✅ **User Management** - Complete CRUD for users with 4 roles (Student, Teacher, Manager, Admin)
- ✅ **Categories & Courses** - Hierarchical category system with course management
- ✅ **Question Bank** - Multiple question types (MCQ Single, MCQ Multi, True/False, Fill Blank, Case-Based)
- ✅ **Exam System** - Complete exam lifecycle with versioning support
- ✅ **Exam Attempts** - Real-time exam taking with auto-save and evaluation
- ✅ **Negative Marking** - Configurable negative marking per question
- ✅ **Results & Analytics** - Detailed performance tracking and statistics

#### Advanced Features
- ✅ **Anti-Cheating Telemetry** - Track tab switches, copy/paste, window blur, etc.
- ✅ **Risk Profiling** - Automatic risk scoring and flagging of suspicious behavior
- ✅ **Audit Logging** - Complete audit trail for compliance (all CRUD operations logged)
- ✅ **Notifications System** - In-app and broadcast notifications
- ✅ **AI Credits Tracking** - Track AI usage and credits consumption
- ✅ **Dashboard Analytics** - Role-based dashboard with performance charts
- ✅ **Leaderboard** - XP-based student ranking system

#### AI Integration (Commented)
- 📝 AI question generation (documented, ready to enable)
- 📝 Course suggestions (documented, ready to enable)
- 📝 Intelligent grading (documented, ready to enable)

### Frontend (React + Tailwind CSS)

#### Student Pages
- ✅ **Dashboard** - Overview with stats, recent activity, performance charts
- ✅ **Courses** - Course catalog with filters, search, and enrollment tracking
- ✅ **Exams** - Available exams with start exam functionality
- ✅ **Take Exam** - Full exam interface with timer, navigation, and auto-save
- ✅ **Results History** - Past results with analytics and trends
- ✅ **Practice Zone** - Multiple practice modes (quick, timed, flashcards, targeted)
- ✅ **Profile** - Edit profile, change password, notification preferences, statistics

#### Manager Pages
- ✅ **Dashboard** - Manager overview with system stats
- ✅ **Categories** - Full CRUD with hierarchical tree view
- ✅ **Question Bank** - Question management with filters
- ✅ **Exam Builder** - Create and manage exams
- ✅ **Student Reports** - Performance reports with filters and export
- ✅ **Analytics** - Charts for exam stats, pass rates, trends
- ✅ **Audit Logs** - Searchable audit log viewer with filters

#### Admin Pages
- ✅ **Dashboard** - System-wide overview
- ✅ **Users** - User management across all tenants
- ✅ **Tenants** - Full tenant CRUD with settings
- ✅ **Billing** - Subscription management with usage tracking
- ✅ **Notifications** - Create campaigns and broadcast messages
- ✅ **Settings** - System settings with feature flags

## 📁 Project Structure

```
HOS/
├── backend/
│   ├── server.py              # Main FastAPI application
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/
│   │   │   ├── api.js        # API client with all endpoints
│   │   │   └── utils.js      # Utility functions
│   │   ├── pages/
│   │   │   ├── student/      # Student pages (8 pages)
│   │   │   ├── manager/      # Manager pages (7 pages)
│   │   │   └── admin/        # Admin pages (6 pages)
│   │   └── store/            # Zustand state management
│   ├── public/
│   └── package.json
├── design_guidelines.json     # Design system specifications
└── README.md
```

## 🛠️ Setup & Installation

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export MONGO_URL="mongodb://localhost:27017"
export DB_NAME="edtech_saas"
export JWT_SECRET="your-super-secret-jwt-key"

# Optional: Enable AI features
export AI_ENABLED="true"
export EMERGENT_LLM_KEY="your-api-key"

# Run the server
python server.py
```

The backend will start on `http://localhost:8001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set backend URL (optional, defaults to same origin)
export REACT_APP_BACKEND_URL="http://localhost:8001"

# Start development server
npm start
```

The frontend will start on `http://localhost:3000`

## 🗄️ Database Schema

### Collections
- **users** - User accounts with roles and profiles
- **tenants** - Multi-tenant organizations
- **subscriptions** - Billing and subscription plans
- **categories** - Hierarchical category tree
- **courses** - Course content and metadata
- **questions** - Question bank with various types
- **exams** - Exam definitions with settings
- **exam_attempts** - Student exam submissions
- **audit_logs** - Audit trail for compliance
- **notifications** - In-app notifications
- **telemetry_events** - Anti-cheating event logs
- **exam_risk_profiles** - Risk assessment for attempts
- **ai_credit_usage** - AI usage tracking

## 🔑 Default Credentials

The system seeds default users on first startup:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eduexam.com | admin123 |
| Manager | manager@eduexam.com | manager123 |
| Teacher | teacher@eduexam.com | teacher123 |
| Student | student@eduexam.com | student123 |

## 🎨 Design System

The application follows the design guidelines in `design_guidelines.json`:

- **Fonts**: Outfit (headings), Plus Jakarta Sans (body), JetBrains Mono (code)
- **Style**: Glassmorphism with backdrop blur effects
- **Layout**: Bento Grid for dashboards
- **Colors**: Indigo primary, with semantic color system
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React
- **Notifications**: Sonner toast library

## 🔐 Security Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Audit logging for all sensitive operations
- ✅ Anti-cheating telemetry and risk profiling
- ✅ Input validation with Pydantic
- ✅ MongoDB injection prevention
- ✅ CORS middleware configuration

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users (Admin/Manager)
- `GET /api/users/{user_id}` - Get user details
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Deactivate user (Admin)

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/tree` - Get category tree
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/{id}` - Get course details
- `POST /api/courses` - Create course
- `PUT /api/courses/{id}` - Update course
- `POST /api/courses/{id}/publish` - Publish course

### Questions
- `GET /api/questions` - List questions
- `POST /api/questions` - Create question
- `POST /api/questions/bulk` - Bulk create
- `PUT /api/questions/{id}` - Update question
- `DELETE /api/questions/{id}` - Delete question

### Exams
- `GET /api/exams` - List exams
- `POST /api/exams` - Create exam
- `PUT /api/exams/{id}` - Update exam (with versioning)
- `POST /api/exams/{id}/publish` - Publish exam
- `POST /api/exams/{id}/start` - Start exam attempt

### Exam Attempts
- `GET /api/attempts` - List attempts
- `GET /api/attempts/{id}` - Get attempt details
- `POST /api/attempts/{id}/sync` - Sync answers during exam
- `POST /api/attempts/{id}/submit` - Submit exam

### Telemetry & Risk
- `POST /api/telemetry/events` - Log telemetry event
- `GET /api/telemetry/events/{attempt_id}` - Get events
- `GET /api/risk-profiles` - List risk profiles
- `GET /api/risk-profiles/{attempt_id}` - Get risk profile
- `PUT /api/risk-profiles/{attempt_id}/review` - Review profile

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Audit Logs
- `GET /api/audit-logs` - Get audit logs (Manager/Admin)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-activity` - Recent activity feed
- `GET /api/dashboard/performance-chart` - Performance trends

### Tenants (Admin)
- `GET /api/tenants` - List tenants
- `POST /api/tenants` - Create tenant
- `PUT /api/tenants/{id}` - Update tenant
- `DELETE /api/tenants/{id}` - Delete tenant

### Subscriptions
- `GET /api/subscriptions` - List all subscriptions (Admin)
- `GET /api/subscriptions/current` - Get current subscription
- `PUT /api/subscriptions/{id}` - Update subscription

### AI Credits
- `GET /api/ai-credits/usage` - Get usage history (Admin)
- `GET /api/ai-credits/balance` - Get credit balance

## 🧪 Testing

### Backend Testing
```bash
cd backend
python backend_test.py
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 Notes

### AI Features
AI features are implemented but commented out with detailed documentation. To enable:
1. Set `AI_ENABLED=true` in environment
2. Configure `EMERGENT_LLM_KEY` with your API key
3. See commented code in `server.py` for implementation details

### Question Import/Export
Question import/export (CSV, JSON) is marked as TODO in the codebase and can be implemented as needed.

### Enrollment Tracking
Course enrollment tracking is partially implemented with mock data. Full implementation requires additional database schema.

## 🚧 Future Enhancements

- [ ] Real-time notifications with WebSocket
- [ ] Advanced analytics with ML insights
- [ ] Mobile app (React Native)
- [ ] Video integration for courses
- [ ] Forum and discussion boards
- [ ] Certificate generation
- [ ] Payment gateway integration
- [ ] Multi-language support

## 📄 License

This project is proprietary software.

## 👥 Contributors

- Development Team
- Code Review: Automated CI/CD pipeline

## 🆘 Support

For issues and questions, please refer to the project documentation or contact the development team.
