# EduExam Pro - Project Documentation

## 📋 Project Specification

**EduExam Pro** is a comprehensive multi-tenant Online Courses & Examination SaaS Platform designed for educational institutions, coaching centers, trainers, and corporates.

### Core Modules

1. **Student Module**
   - Personalized dashboard with XP, level, streak tracking
   - Course enrollment and progress tracking
   - Exam taking with timer and navigation
   - Detailed results with explanations
   - Performance analytics and trends

2. **Teacher/Manager Module**
   - Question bank management (MCQ, True/False, Fill-blank, Case-based)
   - AI-powered question generation using OpenAI GPT
   - Exam creation and publishing
   - Student performance reports
   - Course management

3. **Admin Module**
   - User management across all roles
   - Tenant/organization management
   - System-wide analytics
   - Platform configuration

### Features Implemented
- ✅ JWT-based authentication with role-based access control
- ✅ Multi-tenant architecture
- ✅ All question types (MCQ Single/Multi, True/False, Fill-blank, Case-based)
- ✅ Real-time exam timer with auto-submit
- ✅ AI question generation using OpenAI GPT-4o
- ✅ Performance analytics with charts
- ✅ Gamification (XP points, levels, streaks)
- ✅ Responsive UI with glassmorphism design
- ✅ Dark/Light mode ready

---

## 🛠️ Tech Stack Used & Benefits

### Backend: FastAPI (Python)
**Why FastAPI?**
- ⚡ High performance (comparable to Node.js/Go)
- 📝 Automatic API documentation (Swagger/OpenAPI)
- ✅ Type hints with Pydantic validation
- 🔒 Built-in security features
- 🔄 Async support for better concurrency

### Frontend: React 18
**Why React?**
- 🎯 Component-based architecture
- 🔄 Virtual DOM for efficient updates
- 🌐 Rich ecosystem (React Router, Zustand, etc.)
- 📱 Mobile-first responsive design

### Database: MongoDB
**Why MongoDB?**
- 📄 Flexible document schema
- 🚀 Horizontal scalability
- 🔍 Rich query capabilities
- 📊 Great for analytics workloads

### UI Libraries
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Accessible component library
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **Lucide React** - Modern icons

### AI Integration
- **OpenAI GPT-4o** via Emergent Integrations
- Question generation from topics
- Course suggestions

---

## 🚀 Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB 6+
- Yarn package manager

### Backend Setup
```bash
cd /app/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup
```bash
cd /app/frontend

# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Set REACT_APP_BACKEND_URL

# Run development server
yarn start
```

### Environment Variables

**Backend (.env)**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=edtech_saas
JWT_SECRET=your-super-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EMERGENT_LLM_KEY=your-emergent-key
AI_ENABLED=true
```

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📁 Project Structure

```
/app
├── backend/
│   ├── server.py          # Main FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment config
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   │   └── ui/      # Shadcn components
│   │   ├── pages/       # Page components
│   │   │   ├── student/ # Student pages
│   │   │   ├── manager/ # Manager pages
│   │   │   └── admin/   # Admin pages
│   │   ├── lib/         # Utilities and API
│   │   ├── store/       # Zustand state management
│   │   └── App.js       # Main app component
│   └── package.json
└── docs/                 # Documentation
```

---

## ✨ Best Practices Used

### Code Quality
- **Type Safety**: Pydantic models for validation
- **Error Handling**: Comprehensive try-catch with proper HTTP responses
- **Code Organization**: Modular architecture with clear separation of concerns
- **Comments**: Inline documentation for complex logic

### Security
- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: Access + Refresh token pattern
- **Role-Based Access**: Decorator-based authorization
- **Input Validation**: Pydantic schema validation
- **MongoDB Injection**: ObjectId validation

### Performance
- **Database Indexes**: On frequently queried fields
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React hooks for expensive computations
- **Async Operations**: Non-blocking database calls

### Frontend Best Practices
- **Component Reusability**: Atomic design principles
- **State Management**: Zustand for global state
- **CSS**: Utility-first with Tailwind
- **Accessibility**: ARIA labels and keyboard navigation
- **Test IDs**: data-testid attributes for testing

---

## 🤖 AI Augmentation Guide

### Overview
The platform integrates AI for intelligent question generation and course suggestions using OpenAI GPT-4o through Emergent Integrations.

### Configuration

1. **Enable AI Features**
   ```env
   AI_ENABLED=true
   EMERGENT_LLM_KEY=your-key-here
   ```

2. **API Endpoint**: `POST /api/ai/generate-questions`

### Usage

**Generate Questions**
```python
# Request payload
{
    "category_id": "cat_123",
    "topic": "English Grammar - Tenses",
    "difficulty": "MEDIUM",
    "question_type": "MCQ_SINGLE",
    "count": 5
}
```

**Response**
```json
{
    "message": "Successfully generated 5 questions",
    "questions": [...]
}
```

### How It Works
1. User selects category, topic, and question type
2. System constructs prompt with context
3. GPT-4o generates questions in JSON format
4. Questions are validated and saved to database
5. Created questions appear in question bank

### Customization
- Modify prompt in `/api/ai/generate-questions` endpoint
- Adjust temperature/model in LlmChat configuration
- Add custom validation rules for AI outputs

---

## 🌐 VPS Deployment Guide

### Using Docker (Recommended)

```dockerfile
# Dockerfile for backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongo:27017
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  
  mongo:
    image: mongo:6
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Manual Deployment

1. **Server Requirements**
   - Ubuntu 22.04 LTS
   - 2+ CPU cores, 4GB+ RAM
   - 20GB+ storage

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install -y python3.11 python3.11-venv nodejs npm nginx
   ```

3. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location /api {
           proxy_pass http://localhost:8001;
       }

       location / {
           proxy_pass http://localhost:3000;
       }
   }
   ```

4. **Process Management with PM2**
   ```bash
   pm2 start "uvicorn server:app --port 8001" --name backend
   pm2 start "yarn start" --name frontend
   pm2 save
   ```

---

## 🎨 UI/UX Enhancements Applied

### Design System
- **Colors**: Indigo primary (#4F46E5), Emerald secondary, Pink accent
- **Typography**: Outfit (headings), Plus Jakarta Sans (body)
- **Border Radius**: 0.75rem for modern look

### Visual Effects
- **Glassmorphism**: backdrop-blur with semi-transparent backgrounds
- **Gradients**: Linear gradients on stat cards and buttons
- **Shadows**: Soft drop shadows with glow effects
- **Animations**: Framer Motion for page transitions

### Tailwind CSS Features Used
```css
/* Glass card effect */
.glass-card {
  @apply backdrop-blur-xl bg-white/80 border border-white/30;
}

/* Gradient text */
.text-gradient {
  @apply bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent;
}

/* Animated float */
.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

### Responsive Design
- Mobile-first breakpoints (sm, md, lg, xl)
- Collapsible sidebar on mobile
- Stacked layouts on small screens

### Accessibility
- WCAG 2.1 AA compliant colors
- Focus visible states
- Keyboard navigation
- Screen reader support

---

## 🔮 Future Enhancements

### Phase 2
- [ ] Video courses with progress tracking
- [ ] Live proctoring for exams
- [ ] Certificate generation
- [ ] Payment integration (Stripe)
- [ ] Email notifications

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Offline exam mode
- [ ] Discussion forums
- [ ] Live classes (WebRTC)
- [ ] Advanced analytics with ML

### AI Enhancements
- [ ] Automatic grading for subjective answers
- [ ] Personalized learning paths
- [ ] Plagiarism detection
- [ ] Speech-to-text for verbal exams
- [ ] AI tutoring chatbot

---

## 📞 Support

For issues and feature requests, create an issue in the repository or contact the development team.

**Demo Credentials:**
- Student: student@eduexam.com / student123
- Manager: manager@eduexam.com / manager123
- Admin: admin@eduexam.com / admin123
