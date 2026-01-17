"""
EduExam Pro - Online Courses & Examination SaaS Platform
=========================================================
A comprehensive multi-tenant EdTech platform with:
- Role-based access control (STUDENT, TEACHER, MANAGER, ADMIN)
- Course and content management
- Dynamic examination system
- AI-powered question generation
- Real-time analytics and reporting

Technology Stack:
- FastAPI (Backend API)
- MongoDB (Database)
- JWT (Authentication)
- OpenAI GPT (AI Integration)
"""

import os
import json
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from enum import Enum
from bson import ObjectId

from fastapi import FastAPI, HTTPException, Depends, status, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr, field_validator
from pymongo import MongoClient, ASCENDING, DESCENDING
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ===========================================
# CONFIGURATION
# ===========================================

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "edtech_saas")
JWT_SECRET = os.environ.get("JWT_SECRET", "your-super-secret-jwt-key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
AI_ENABLED = os.environ.get("AI_ENABLED", "true").lower() == "true"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# ===========================================
# ENUMS
# ===========================================

class UserRole(str, Enum):
    STUDENT = "STUDENT"
    TEACHER = "TEACHER"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"

class QuestionType(str, Enum):
    MCQ_SINGLE = "MCQ_SINGLE"
    MCQ_MULTI = "MCQ_MULTI"
    TRUE_FALSE = "TRUE_FALSE"
    FILL_BLANK = "FILL_BLANK"
    CASE_BASED = "CASE_BASED"

class DifficultyLevel(str, Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"
    EXPERT = "EXPERT"

class ExamStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"

class AttemptStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    EVALUATED = "EVALUATED"
    EXPIRED = "EXPIRED"

# ===========================================
# PYDANTIC MODELS - REQUEST/RESPONSE
# ===========================================

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.STUDENT
    tenant_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    tenant_id: Optional[str]
    avatar: Optional[str]
    xp_points: int = 0
    level: int = 1
    streak: int = 0
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[str] = None
    icon: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str]
    parent_id: Optional[str]
    icon: Optional[str]
    is_active: bool
    created_at: datetime

class CourseCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str
    category_id: str
    thumbnail: Optional[str] = None
    duration_hours: Optional[int] = None
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    is_featured: bool = False
    tags: List[str] = []

class CourseResponse(BaseModel):
    id: str
    title: str
    description: str
    category_id: str
    thumbnail: Optional[str]
    duration_hours: Optional[int]
    difficulty: DifficultyLevel
    is_featured: bool
    tags: List[str]
    instructor_id: str
    instructor_name: Optional[str]
    enrollment_count: int
    rating: float
    is_published: bool
    created_at: datetime

class QuestionCreate(BaseModel):
    category_id: str
    type: QuestionType
    text: str = Field(..., min_length=10)
    options: Optional[List[Dict[str, Any]]] = None
    correct_answer: Any
    explanation: Optional[str] = None
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    marks: int = Field(default=1, ge=1, le=100)
    negative_marks: float = Field(default=0, ge=0)
    tags: List[str] = []
    case_context: Optional[str] = None  # For case-based questions

class QuestionResponse(BaseModel):
    id: str
    category_id: str
    type: QuestionType
    text: str
    options: Optional[List[Dict[str, Any]]]
    correct_answer: Any
    explanation: Optional[str]
    difficulty: DifficultyLevel
    marks: int
    negative_marks: float
    tags: List[str]
    case_context: Optional[str]
    created_by: str
    created_at: datetime

class ExamCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    category_id: str
    duration_minutes: int = Field(default=60, ge=5, le=480)
    total_marks: int = Field(default=100, ge=1)
    passing_marks: int = Field(default=40, ge=0)
    instructions: Optional[str] = None
    shuffle_questions: bool = True
    shuffle_options: bool = True
    show_result_immediately: bool = True
    allow_review: bool = True
    negative_marking: bool = False
    question_ids: List[str] = []

class ExamResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    category_id: str
    duration_minutes: int
    total_marks: int
    passing_marks: int
    instructions: Optional[str]
    shuffle_questions: bool
    shuffle_options: bool
    show_result_immediately: bool
    allow_review: bool
    negative_marking: bool
    status: ExamStatus
    question_count: int
    created_by: str
    version: int
    created_at: datetime

class ExamAttemptCreate(BaseModel):
    exam_id: str

class AnswerSubmit(BaseModel):
    question_id: str
    answer: Any
    time_spent_seconds: int = 0

class AttemptSubmit(BaseModel):
    answers: List[AnswerSubmit]

class AttemptResultResponse(BaseModel):
    id: str
    exam_id: str
    exam_title: str
    user_id: str
    score: int
    total_marks: int
    percentage: float
    passed: bool
    correct_count: int
    incorrect_count: int
    unanswered_count: int
    time_taken_seconds: int
    started_at: datetime
    submitted_at: datetime
    detailed_results: Optional[List[Dict[str, Any]]] = None

class AIQuestionGenerate(BaseModel):
    category_id: str
    topic: str
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    question_type: QuestionType = QuestionType.MCQ_SINGLE
    count: int = Field(default=5, ge=1, le=20)

class TenantCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    domain: Optional[str] = None
    logo: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class TenantResponse(BaseModel):
    id: str
    name: str
    domain: Optional[str]
    logo: Optional[str]
    settings: Optional[Dict[str, Any]]
    is_active: bool
    created_at: datetime

class DashboardStats(BaseModel):
    total_users: int
    total_courses: int
    total_exams: int
    total_questions: int
    total_attempts: int
    recent_enrollments: int
    active_users_today: int
    average_score: float
    pass_rate: float

# ===========================================
# DATABASE CONNECTION & LIFECYCLE
# ===========================================

client: MongoClient = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    global client, db
    # Startup
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Create indexes for better performance
    db.users.create_index([("email", ASCENDING)], unique=True)
    db.users.create_index([("tenant_id", ASCENDING)])
    db.categories.create_index([("slug", ASCENDING), ("tenant_id", ASCENDING)], unique=True)
    db.courses.create_index([("category_id", ASCENDING)])
    db.questions.create_index([("category_id", ASCENDING), ("difficulty", ASCENDING)])
    db.exams.create_index([("category_id", ASCENDING), ("status", ASCENDING)])
    db.exam_attempts.create_index([("user_id", ASCENDING), ("exam_id", ASCENDING)])
    
    # Seed default data if empty
    await seed_default_data()
    
    print(f"✅ Connected to MongoDB: {DB_NAME}")
    yield
    
    # Shutdown
    client.close()
    print("❌ Disconnected from MongoDB")

# ===========================================
# FASTAPI APPLICATION
# ===========================================

app = FastAPI(
    title="EduExam Pro API",
    description="Online Courses & Examination SaaS Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===========================================
# UTILITY FUNCTIONS
# ===========================================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

# ===========================================
# AUTHENTICATION DEPENDENCIES
# ===========================================

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return serialize_doc(user)

async def require_role(required_roles: List[UserRole]):
    """Dependency factory to require specific roles"""
    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] not in [r.value for r in required_roles]:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required roles: {[r.value for r in required_roles]}"
            )
        return current_user
    return role_checker

# ===========================================
# SEED DEFAULT DATA
# ===========================================

async def seed_default_data():
    """Seed database with default data if empty"""
    # Create default tenant
    if db.tenants.count_documents({}) == 0:
        default_tenant = {
            "name": "Default Organization",
            "domain": "default",
            "logo": None,
            "settings": {"theme": "light", "language": "en"},
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        tenant_result = db.tenants.insert_one(default_tenant)
        tenant_id = str(tenant_result.inserted_id)
        
        # Create admin user
        admin_user = {
            "name": "Admin User",
            "email": "admin@eduexam.com",
            "password": hash_password("admin123"),
            "role": UserRole.ADMIN.value,
            "tenant_id": tenant_id,
            "avatar": "https://ui-avatars.com/api/?name=Admin&background=4F46E5&color=fff",
            "xp_points": 5000,
            "level": 10,
            "streak": 30,
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        db.users.insert_one(admin_user)
        
        # Create manager user
        manager_user = {
            "name": "Manager User",
            "email": "manager@eduexam.com",
            "password": hash_password("manager123"),
            "role": UserRole.MANAGER.value,
            "tenant_id": tenant_id,
            "avatar": "https://ui-avatars.com/api/?name=Manager&background=10B981&color=fff",
            "xp_points": 3000,
            "level": 7,
            "streak": 15,
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        db.users.insert_one(manager_user)
        
        # Create teacher user
        teacher_user = {
            "name": "Teacher User",
            "email": "teacher@eduexam.com",
            "password": hash_password("teacher123"),
            "role": UserRole.TEACHER.value,
            "tenant_id": tenant_id,
            "avatar": "https://ui-avatars.com/api/?name=Teacher&background=F59E0B&color=fff",
            "xp_points": 2000,
            "level": 5,
            "streak": 10,
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        teacher_result = db.users.insert_one(teacher_user)
        teacher_id = str(teacher_result.inserted_id)
        
        # Create student user
        student_user = {
            "name": "Student User",
            "email": "student@eduexam.com",
            "password": hash_password("student123"),
            "role": UserRole.STUDENT.value,
            "tenant_id": tenant_id,
            "avatar": "https://ui-avatars.com/api/?name=Student&background=EC4899&color=fff",
            "xp_points": 500,
            "level": 3,
            "streak": 5,
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        db.users.insert_one(student_user)
        
        # Create default categories
        categories = [
            {"name": "IELTS", "slug": "ielts", "description": "IELTS Exam Preparation", "icon": "📝"},
            {"name": "Mathematics", "slug": "mathematics", "description": "Mathematics and Aptitude", "icon": "📐"},
            {"name": "Science", "slug": "science", "description": "Science and Technology", "icon": "🔬"},
            {"name": "Computer Science", "slug": "computer-science", "description": "Programming and IT", "icon": "💻"},
            {"name": "General Knowledge", "slug": "general-knowledge", "description": "GK and Current Affairs", "icon": "🌍"},
            {"name": "English", "slug": "english", "description": "English Language Skills", "icon": "📚"},
        ]
        
        category_ids = {}
        for cat in categories:
            cat["tenant_id"] = tenant_id
            cat["parent_id"] = None
            cat["is_active"] = True
            cat["created_at"] = datetime.now(timezone.utc)
            result = db.categories.insert_one(cat)
            category_ids[cat["slug"]] = str(result.inserted_id)
        
        # Create sample courses
        courses = [
            {
                "title": "IELTS Complete Preparation Course",
                "description": "Master all four IELTS sections with comprehensive practice materials",
                "category_id": category_ids["ielts"],
                "thumbnail": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
                "duration_hours": 40,
                "difficulty": DifficultyLevel.MEDIUM.value,
                "is_featured": True,
                "tags": ["ielts", "english", "exam"],
                "instructor_id": teacher_id,
                "enrollment_count": 1250,
                "rating": 4.8,
                "is_published": True,
            },
            {
                "title": "Advanced Mathematics for Competitive Exams",
                "description": "Complete math preparation for various competitive examinations",
                "category_id": category_ids["mathematics"],
                "thumbnail": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
                "duration_hours": 60,
                "difficulty": DifficultyLevel.HARD.value,
                "is_featured": True,
                "tags": ["math", "aptitude", "competitive"],
                "instructor_id": teacher_id,
                "enrollment_count": 890,
                "rating": 4.6,
                "is_published": True,
            },
            {
                "title": "Python Programming Fundamentals",
                "description": "Learn Python from scratch with hands-on projects",
                "category_id": category_ids["computer-science"],
                "thumbnail": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80",
                "duration_hours": 30,
                "difficulty": DifficultyLevel.EASY.value,
                "is_featured": False,
                "tags": ["python", "programming", "beginner"],
                "instructor_id": teacher_id,
                "enrollment_count": 2100,
                "rating": 4.9,
                "is_published": True,
            }
        ]
        
        for course in courses:
            course["tenant_id"] = tenant_id
            course["created_at"] = datetime.now(timezone.utc)
            db.courses.insert_one(course)
        
        # Create sample questions for IELTS category
        ielts_questions = [
            {
                "category_id": category_ids["ielts"],
                "type": QuestionType.MCQ_SINGLE.value,
                "text": "Choose the correct word to complete the sentence: The weather forecast _____ heavy rain tomorrow.",
                "options": [
                    {"id": "a", "text": "predicts"},
                    {"id": "b", "text": "predict"},
                    {"id": "c", "text": "predicting"},
                    {"id": "d", "text": "predicted"}
                ],
                "correct_answer": "a",
                "explanation": "'Predicts' is correct because the subject 'forecast' is singular and requires a singular verb.",
                "difficulty": DifficultyLevel.EASY.value,
                "marks": 1,
                "negative_marks": 0.25,
                "tags": ["grammar", "vocabulary"],
            },
            {
                "category_id": category_ids["ielts"],
                "type": QuestionType.TRUE_FALSE.value,
                "text": "In IELTS Writing Task 2, you should always give your personal opinion.",
                "options": [
                    {"id": "true", "text": "True"},
                    {"id": "false", "text": "False"}
                ],
                "correct_answer": "false",
                "explanation": "Not all IELTS Writing Task 2 questions require personal opinion. Some ask you to discuss both sides without giving your view.",
                "difficulty": DifficultyLevel.MEDIUM.value,
                "marks": 1,
                "negative_marks": 0,
                "tags": ["writing", "strategy"],
            },
            {
                "category_id": category_ids["ielts"],
                "type": QuestionType.MCQ_MULTI.value,
                "text": "Select ALL the correct ways to improve your IELTS speaking score:",
                "options": [
                    {"id": "a", "text": "Practice speaking English daily"},
                    {"id": "b", "text": "Memorize long, complex answers"},
                    {"id": "c", "text": "Use a variety of vocabulary"},
                    {"id": "d", "text": "Speak naturally with proper intonation"}
                ],
                "correct_answer": ["a", "c", "d"],
                "explanation": "Memorizing answers is not recommended as examiners can detect rehearsed responses.",
                "difficulty": DifficultyLevel.MEDIUM.value,
                "marks": 2,
                "negative_marks": 0.5,
                "tags": ["speaking", "tips"],
            },
            {
                "category_id": category_ids["ielts"],
                "type": QuestionType.FILL_BLANK.value,
                "text": "Complete the sentence: The IELTS test has four sections: Listening, Reading, Writing, and _____.",
                "options": None,
                "correct_answer": "Speaking",
                "explanation": "The IELTS test consists of four sections: Listening, Reading, Writing, and Speaking.",
                "difficulty": DifficultyLevel.EASY.value,
                "marks": 1,
                "negative_marks": 0,
                "tags": ["basics", "format"],
            },
            {
                "category_id": category_ids["ielts"],
                "type": QuestionType.CASE_BASED.value,
                "text": "Based on the passage, what is the main argument presented by the author?",
                "case_context": "Climate change represents one of the most significant challenges facing humanity today. Scientists worldwide have reached a consensus that human activities, particularly the burning of fossil fuels, are the primary cause of global warming. The consequences of inaction could be catastrophic, including rising sea levels, extreme weather events, and widespread biodiversity loss.",
                "options": [
                    {"id": "a", "text": "Climate change is a natural phenomenon"},
                    {"id": "b", "text": "Human activities are causing global warming"},
                    {"id": "c", "text": "Scientists disagree about climate change"},
                    {"id": "d", "text": "Fossil fuels are beneficial for the environment"}
                ],
                "correct_answer": "b",
                "explanation": "The passage clearly states that 'human activities, particularly the burning of fossil fuels, are the primary cause of global warming.'",
                "difficulty": DifficultyLevel.HARD.value,
                "marks": 3,
                "negative_marks": 0.75,
                "tags": ["reading", "comprehension"],
            }
        ]
        
        question_ids = []
        for q in ielts_questions:
            q["tenant_id"] = tenant_id
            q["created_by"] = teacher_id
            q["is_active"] = True
            q["created_at"] = datetime.now(timezone.utc)
            result = db.questions.insert_one(q)
            question_ids.append(str(result.inserted_id))
        
        # Create sample exam
        sample_exam = {
            "title": "IELTS Practice Test - Reading & Grammar",
            "description": "Practice test covering reading comprehension and grammar skills",
            "category_id": category_ids["ielts"],
            "duration_minutes": 30,
            "total_marks": 8,
            "passing_marks": 5,
            "instructions": "Read each question carefully. You can navigate between questions using the navigation panel.",
            "shuffle_questions": True,
            "shuffle_options": True,
            "show_result_immediately": True,
            "allow_review": True,
            "negative_marking": True,
            "question_ids": question_ids,
            "status": ExamStatus.PUBLISHED.value,
            "version": 1,
            "tenant_id": tenant_id,
            "created_by": teacher_id,
            "created_at": datetime.now(timezone.utc)
        }
        db.exams.insert_one(sample_exam)
        
        print("✅ Default data seeded successfully")

# ===========================================
# API ROUTES - HEALTH CHECK
# ===========================================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "EduExam Pro API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ===========================================
# API ROUTES - AUTHENTICATION
# ===========================================

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if email exists
    if db.users.find_one({"email": user_data.email.lower()}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Get default tenant
    tenant = db.tenants.find_one({"domain": "default"})
    tenant_id = str(tenant["_id"]) if tenant else None
    
    # Create user
    user = {
        "name": user_data.name,
        "email": user_data.email.lower(),
        "password": hash_password(user_data.password),
        "role": user_data.role.value,
        "tenant_id": user_data.tenant_id or tenant_id,
        "avatar": f"https://ui-avatars.com/api/?name={user_data.name.replace(' ', '+')}&background=4F46E5&color=fff",
        "xp_points": 0,
        "level": 1,
        "streak": 0,
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db.users.insert_one(user)
    user["_id"] = result.inserted_id
    user_response = serialize_doc(user)
    del user_response["password"]
    
    # Create tokens
    access_token = create_access_token({"sub": str(result.inserted_id)})
    refresh_token = create_refresh_token({"sub": str(result.inserted_id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(**user_response)
    )

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login with email and password"""
    user = db.users.find_one({"email": credentials.email.lower()})
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    user_response = serialize_doc(user)
    del user_response["password"]
    
    # Update streak
    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )
    
    # Create tokens
    access_token = create_access_token({"sub": str(user["_id"])})
    refresh_token = create_refresh_token({"sub": str(user["_id"])})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(**user_response)
    )

@app.post("/api/auth/refresh")
async def refresh_token(refresh_token: str = Body(..., embed=True)):
    """Refresh access token using refresh token"""
    payload = decode_token(refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    user_id = payload.get("sub")
    user = db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    new_access_token = create_access_token({"sub": user_id})
    
    return {"access_token": new_access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(**current_user)

# ===========================================
# API ROUTES - USERS
# ===========================================

@app.get("/api/users")
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all users (Admin/Manager only)"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = {"tenant_id": current_user.get("tenant_id")}
    if role:
        query["role"] = role.value
    
    users = list(db.users.find(query, {"password": 0}).skip(skip).limit(limit))
    total = db.users.count_documents(query)
    
    return {
        "users": [serialize_doc(u) for u in users],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@app.put("/api/users/{user_id}")
async def update_user(
    user_id: str,
    updates: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    # Users can only update their own profile, admins can update anyone
    if user_id != current_user["id"] and current_user["role"] != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Remove protected fields
    protected_fields = ["password", "email", "role", "tenant_id", "_id"]
    for field in protected_fields:
        updates.pop(field, None)
    
    updates["updated_at"] = datetime.now(timezone.utc)
    
    result = db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    return serialize_doc(user)

# ===========================================
# API ROUTES - CATEGORIES
# ===========================================

@app.get("/api/categories")
async def get_categories(
    include_inactive: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Get all categories"""
    query = {"tenant_id": current_user.get("tenant_id")}
    if not include_inactive:
        query["is_active"] = True
    
    categories = list(db.categories.find(query))
    return [serialize_doc(c) for c in categories]

@app.post("/api/categories", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new category (Manager/Admin only)"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    category = {
        **category_data.model_dump(),
        "tenant_id": current_user.get("tenant_id"),
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db.categories.insert_one(category)
    category["_id"] = result.inserted_id
    
    return CategoryResponse(**serialize_doc(category))

@app.put("/api/categories/{category_id}")
async def update_category(
    category_id: str,
    updates: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update a category"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updates["updated_at"] = datetime.now(timezone.utc)
    
    result = db.categories.update_one(
        {"_id": ObjectId(category_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": updates}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category = db.categories.find_one({"_id": ObjectId(category_id)})
    return serialize_doc(category)

# ===========================================
# API ROUTES - COURSES
# ===========================================

@app.get("/api/courses")
async def get_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[str] = None,
    is_featured: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all courses"""
    query = {"tenant_id": current_user.get("tenant_id"), "is_published": True}
    
    if category_id:
        query["category_id"] = category_id
    if is_featured is not None:
        query["is_featured"] = is_featured
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    courses = list(db.courses.find(query).skip(skip).limit(limit).sort("created_at", DESCENDING))
    total = db.courses.count_documents(query)
    
    # Enrich with instructor names
    for course in courses:
        instructor = db.users.find_one({"_id": ObjectId(course.get("instructor_id"))}, {"name": 1})
        course["instructor_name"] = instructor.get("name") if instructor else "Unknown"
    
    return {
        "courses": [serialize_doc(c) for c in courses],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@app.get("/api/courses/{course_id}")
async def get_course(course_id: str, current_user: dict = Depends(get_current_user)):
    """Get a single course by ID"""
    course = db.courses.find_one({"_id": ObjectId(course_id)})
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    instructor = db.users.find_one({"_id": ObjectId(course.get("instructor_id"))}, {"name": 1})
    course["instructor_name"] = instructor.get("name") if instructor else "Unknown"
    
    return serialize_doc(course)

@app.post("/api/courses", response_model=CourseResponse)
async def create_course(
    course_data: CourseCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new course (Teacher/Manager/Admin only)"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value, UserRole.TEACHER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    course = {
        **course_data.model_dump(),
        "tenant_id": current_user.get("tenant_id"),
        "instructor_id": current_user["id"],
        "enrollment_count": 0,
        "rating": 0.0,
        "is_published": False,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db.courses.insert_one(course)
    course["_id"] = result.inserted_id
    course["instructor_name"] = current_user["name"]
    
    return CourseResponse(**serialize_doc(course))

@app.put("/api/courses/{course_id}")
async def update_course(
    course_id: str,
    updates: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update a course"""
    course = db.courses.find_one({"_id": ObjectId(course_id)})
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Only instructor or admin can update
    if course["instructor_id"] != current_user["id"] and current_user["role"] != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updates["updated_at"] = datetime.now(timezone.utc)
    
    db.courses.update_one({"_id": ObjectId(course_id)}, {"$set": updates})
    
    updated_course = db.courses.find_one({"_id": ObjectId(course_id)})
    return serialize_doc(updated_course)

# ===========================================
# API ROUTES - QUESTIONS
# ===========================================

@app.get("/api/questions")
async def get_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[str] = None,
    difficulty: Optional[DifficultyLevel] = None,
    question_type: Optional[QuestionType] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get questions (Teacher/Manager/Admin only)"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value, UserRole.TEACHER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = {"tenant_id": current_user.get("tenant_id"), "is_active": True}
    
    if category_id:
        query["category_id"] = category_id
    if difficulty:
        query["difficulty"] = difficulty.value
    if question_type:
        query["type"] = question_type.value
    if search:
        query["text"] = {"$regex": search, "$options": "i"}
    
    questions = list(db.questions.find(query).skip(skip).limit(limit).sort("created_at", DESCENDING))
    total = db.questions.count_documents(query)
    
    return {
        "questions": [serialize_doc(q) for q in questions],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@app.get("/api/questions/{question_id}")
async def get_question(question_id: str, current_user: dict = Depends(get_current_user)):
    """Get a single question"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value, UserRole.TEACHER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    question = db.questions.find_one({"_id": ObjectId(question_id)})
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return serialize_doc(question)

@app.post("/api/questions", response_model=QuestionResponse)
async def create_question(
    question_data: QuestionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new question (Teacher/Manager/Admin only)"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value, UserRole.TEACHER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    question = {
        **question_data.model_dump(),
        "tenant_id": current_user.get("tenant_id"),
        "created_by": current_user["id"],
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db.questions.insert_one(question)
    question["_id"] = result.inserted_id
    
    return QuestionResponse(**serialize_doc(question))

@app.put("/api/questions/{question_id}")
async def update_question(
    question_id: str,
    updates: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update a question"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value, UserRole.TEACHER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updates["updated_at"] = datetime.now(timezone.utc)
    
    result = db.questions.update_one(
        {"_id": ObjectId(question_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": updates}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    
    question = db.questions.find_one({"_id": ObjectId(question_id)})
    return serialize_doc(question)

@app.delete("/api/questions/{question_id}")
async def delete_question(question_id: str, current_user: dict = Depends(get_current_user)):
    """Soft delete a question"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = db.questions.update_one(
        {"_id": ObjectId(question_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": {"is_active": False, "deleted_at": datetime.now(timezone.utc)}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return {"message": "Question deleted successfully"}

# ===========================================
# API ROUTES - EXAMS
# ===========================================

@app.get("/api/exams")
async def get_exams(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[str] = None,
    status: Optional[ExamStatus] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all exams"""
    query = {"tenant_id": current_user.get("tenant_id")}
    
    # Students can only see published exams
    if current_user["role"] == UserRole.STUDENT.value:
        query["status"] = {"$in": [ExamStatus.PUBLISHED.value, ExamStatus.ACTIVE.value]}
    elif status:
        query["status"] = status.value
    
    if category_id:
        query["category_id"] = category_id
    
    exams = list(db.exams.find(query).skip(skip).limit(limit).sort("created_at", DESCENDING))
    total = db.exams.count_documents(query)
    
    # Add question count
    for exam in exams:
        exam["question_count"] = len(exam.get("question_ids", []))
    
    return {
        "exams": [serialize_doc(e) for e in exams],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@app.get("/api/exams/{exam_id}")
async def get_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Get exam details"""
    exam = db.exams.find_one({"_id": ObjectId(exam_id)})
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    exam["question_count"] = len(exam.get("question_ids", []))
    
    # Get category name
    category = db.categories.find_one({"_id": ObjectId(exam.get("category_id"))})
    exam["category_name"] = category.get("name") if category else "Unknown"
    
    return serialize_doc(exam)

@app.post("/api/exams", response_model=ExamResponse)
async def create_exam(
    exam_data: ExamCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new exam (Teacher/Manager/Admin only)"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value, UserRole.TEACHER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    exam = {
        **exam_data.model_dump(),
        "tenant_id": current_user.get("tenant_id"),
        "created_by": current_user["id"],
        "status": ExamStatus.DRAFT.value,
        "version": 1,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db.exams.insert_one(exam)
    exam["_id"] = result.inserted_id
    exam["question_count"] = len(exam.get("question_ids", []))
    
    return ExamResponse(**serialize_doc(exam))

@app.put("/api/exams/{exam_id}")
async def update_exam(
    exam_id: str,
    updates: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update an exam"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value, UserRole.TEACHER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updates["updated_at"] = datetime.now(timezone.utc)
    
    result = db.exams.update_one(
        {"_id": ObjectId(exam_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": updates}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    exam = db.exams.find_one({"_id": ObjectId(exam_id)})
    exam["question_count"] = len(exam.get("question_ids", []))
    
    return serialize_doc(exam)

@app.post("/api/exams/{exam_id}/publish")
async def publish_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Publish an exam"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    exam = db.exams.find_one({"_id": ObjectId(exam_id)})
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    if len(exam.get("question_ids", [])) == 0:
        raise HTTPException(status_code=400, detail="Cannot publish exam without questions")
    
    db.exams.update_one(
        {"_id": ObjectId(exam_id)},
        {"$set": {"status": ExamStatus.PUBLISHED.value, "published_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Exam published successfully"}

# ===========================================
# API ROUTES - EXAM ATTEMPTS
# ===========================================

@app.post("/api/exams/{exam_id}/start")
async def start_exam_attempt(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Start a new exam attempt"""
    exam = db.exams.find_one({"_id": ObjectId(exam_id)})
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    if exam["status"] not in [ExamStatus.PUBLISHED.value, ExamStatus.ACTIVE.value]:
        raise HTTPException(status_code=400, detail="Exam is not available")
    
    # Check for existing in-progress attempt
    existing_attempt = db.exam_attempts.find_one({
        "exam_id": exam_id,
        "user_id": current_user["id"],
        "status": AttemptStatus.IN_PROGRESS.value
    })
    
    if existing_attempt:
        # Return existing attempt
        questions = list(db.questions.find(
            {"_id": {"$in": [ObjectId(qid) for qid in exam["question_ids"]]}},
            {"correct_answer": 0, "explanation": 0}  # Hide answers
        ))
        
        return {
            "attempt_id": str(existing_attempt["_id"]),
            "exam": serialize_doc(exam),
            "questions": [serialize_doc(q) for q in questions],
            "started_at": existing_attempt["started_at"].isoformat(),
            "time_remaining_seconds": max(0, exam["duration_minutes"] * 60 - 
                (datetime.now(timezone.utc) - existing_attempt["started_at"]).seconds)
        }
    
    # Create new attempt
    attempt = {
        "exam_id": exam_id,
        "user_id": current_user["id"],
        "tenant_id": current_user.get("tenant_id"),
        "status": AttemptStatus.IN_PROGRESS.value,
        "answers": [],
        "started_at": datetime.now(timezone.utc)
    }
    
    result = db.exam_attempts.insert_one(attempt)
    
    # Get questions (hide correct answers)
    questions = list(db.questions.find(
        {"_id": {"$in": [ObjectId(qid) for qid in exam["question_ids"]]}},
        {"correct_answer": 0, "explanation": 0}
    ))
    
    # Shuffle if required
    if exam.get("shuffle_questions", True):
        import random
        random.shuffle(questions)
    
    return {
        "attempt_id": str(result.inserted_id),
        "exam": serialize_doc(exam),
        "questions": [serialize_doc(q) for q in questions],
        "started_at": attempt["started_at"].isoformat(),
        "time_remaining_seconds": exam["duration_minutes"] * 60
    }

@app.post("/api/attempts/{attempt_id}/submit", response_model=AttemptResultResponse)
async def submit_exam_attempt(
    attempt_id: str,
    submission: AttemptSubmit,
    current_user: dict = Depends(get_current_user)
):
    """Submit exam answers and get results"""
    attempt = db.exam_attempts.find_one({"_id": ObjectId(attempt_id)})
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if attempt["status"] != AttemptStatus.IN_PROGRESS.value:
        raise HTTPException(status_code=400, detail="Attempt already submitted")
    
    # Get exam and questions
    exam = db.exams.find_one({"_id": ObjectId(attempt["exam_id"])})
    questions = {str(q["_id"]): q for q in db.questions.find(
        {"_id": {"$in": [ObjectId(qid) for qid in exam["question_ids"]]}}
    )}
    
    # Evaluate answers
    score = 0
    correct_count = 0
    incorrect_count = 0
    detailed_results = []
    
    answered_ids = set()
    
    for answer in submission.answers:
        answered_ids.add(answer.question_id)
        question = questions.get(answer.question_id)
        
        if not question:
            continue
        
        is_correct = False
        
        # Check answer based on question type
        if question["type"] == QuestionType.MCQ_MULTI.value:
            # Multiple correct answers
            correct_set = set(question["correct_answer"]) if isinstance(question["correct_answer"], list) else {question["correct_answer"]}
            answer_set = set(answer.answer) if isinstance(answer.answer, list) else {answer.answer}
            is_correct = correct_set == answer_set
        else:
            # Single answer comparison
            is_correct = str(answer.answer).lower().strip() == str(question["correct_answer"]).lower().strip()
        
        if is_correct:
            score += question["marks"]
            correct_count += 1
        else:
            if exam.get("negative_marking", False):
                score -= question.get("negative_marks", 0)
            incorrect_count += 1
        
        detailed_results.append({
            "question_id": answer.question_id,
            "question_text": question["text"],
            "your_answer": answer.answer,
            "correct_answer": question["correct_answer"],
            "is_correct": is_correct,
            "marks_obtained": question["marks"] if is_correct else (-question.get("negative_marks", 0) if exam.get("negative_marking") else 0),
            "explanation": question.get("explanation"),
            "time_spent_seconds": answer.time_spent_seconds
        })
    
    # Calculate unanswered
    unanswered_count = len(exam["question_ids"]) - len(answered_ids)
    
    # Calculate time taken
    time_taken = int((datetime.now(timezone.utc) - attempt["started_at"]).total_seconds())
    
    # Calculate percentage and pass status
    percentage = (score / exam["total_marks"]) * 100 if exam["total_marks"] > 0 else 0
    passed = score >= exam["passing_marks"]
    
    # Update attempt
    db.exam_attempts.update_one(
        {"_id": ObjectId(attempt_id)},
        {"$set": {
            "status": AttemptStatus.EVALUATED.value,
            "answers": [a.model_dump() for a in submission.answers],
            "score": max(0, score),
            "correct_count": correct_count,
            "incorrect_count": incorrect_count,
            "unanswered_count": unanswered_count,
            "percentage": percentage,
            "passed": passed,
            "time_taken_seconds": time_taken,
            "submitted_at": datetime.now(timezone.utc),
            "detailed_results": detailed_results
        }}
    )
    
    # Award XP to user
    xp_earned = score * 10 + (50 if passed else 0)
    db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$inc": {"xp_points": xp_earned}}
    )
    
    return AttemptResultResponse(
        id=attempt_id,
        exam_id=attempt["exam_id"],
        exam_title=exam["title"],
        user_id=current_user["id"],
        score=max(0, score),
        total_marks=exam["total_marks"],
        percentage=round(percentage, 2),
        passed=passed,
        correct_count=correct_count,
        incorrect_count=incorrect_count,
        unanswered_count=unanswered_count,
        time_taken_seconds=time_taken,
        started_at=attempt["started_at"],
        submitted_at=datetime.now(timezone.utc),
        detailed_results=detailed_results if exam.get("show_result_immediately", True) else None
    )

@app.get("/api/attempts")
async def get_user_attempts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get current user's exam attempts"""
    query = {"user_id": current_user["id"]}
    
    attempts = list(db.exam_attempts.find(query).skip(skip).limit(limit).sort("started_at", DESCENDING))
    total = db.exam_attempts.count_documents(query)
    
    # Enrich with exam titles
    for attempt in attempts:
        exam = db.exams.find_one({"_id": ObjectId(attempt["exam_id"])}, {"title": 1})
        attempt["exam_title"] = exam.get("title") if exam else "Unknown"
    
    return {
        "attempts": [serialize_doc(a) for a in attempts],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@app.get("/api/attempts/{attempt_id}")
async def get_attempt_detail(attempt_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed attempt result"""
    attempt = db.exam_attempts.find_one({"_id": ObjectId(attempt_id)})
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    # Allow user to see their own attempts, or admin/manager to see all
    if attempt["user_id"] != current_user["id"] and current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    exam = db.exams.find_one({"_id": ObjectId(attempt["exam_id"])})
    attempt["exam_title"] = exam.get("title") if exam else "Unknown"
    
    return serialize_doc(attempt)

# ===========================================
# API ROUTES - AI SERVICES
# ===========================================

@app.post("/api/ai/generate-questions")
async def generate_questions_ai(
    request: AIQuestionGenerate,
    current_user: dict = Depends(get_current_user)
):
    """Generate questions using AI (Teacher/Manager/Admin only)"""
    if current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value, UserRole.TEACHER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not AI_ENABLED or not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="AI service is not configured")
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Get category name
        category = db.categories.find_one({"_id": ObjectId(request.category_id)})
        category_name = category.get("name", "General") if category else "General"
        
        # Create AI prompt
        prompt = f"""Generate {request.count} {request.question_type.value} questions about "{request.topic}" for {category_name} category.
Difficulty level: {request.difficulty.value}

Return a JSON array with this exact structure for each question:
{{
    "text": "Question text here",
    "options": [
        {{"id": "a", "text": "Option A"}},
        {{"id": "b", "text": "Option B"}},
        {{"id": "c", "text": "Option C"}},
        {{"id": "d", "text": "Option D"}}
    ],
    "correct_answer": "a",
    "explanation": "Why this answer is correct",
    "tags": ["tag1", "tag2"]
}}

For TRUE_FALSE type, use options: [{{"id": "true", "text": "True"}}, {{"id": "false", "text": "False"}}]
For FILL_BLANK type, options should be null and correct_answer should be the word/phrase.
For MCQ_MULTI type, correct_answer should be an array like ["a", "c"].

Return ONLY the JSON array, no other text."""

        # Initialize AI chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"question-gen-{current_user['id']}-{datetime.now().timestamp()}",
            system_message="You are an expert educational content creator specializing in creating high-quality exam questions."
        )
        chat.with_model("openai", "gpt-4o")
        
        # Send message
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse response
        try:
            # Clean response and parse JSON
            response_text = response.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            questions_data = json.loads(response_text.strip())
            
            # Save questions to database
            saved_questions = []
            for q_data in questions_data:
                question = {
                    "category_id": request.category_id,
                    "type": request.question_type.value,
                    "text": q_data["text"],
                    "options": q_data.get("options"),
                    "correct_answer": q_data["correct_answer"],
                    "explanation": q_data.get("explanation", ""),
                    "difficulty": request.difficulty.value,
                    "marks": 1,
                    "negative_marks": 0.25 if request.difficulty.value in ["HARD", "EXPERT"] else 0,
                    "tags": q_data.get("tags", [request.topic]),
                    "case_context": q_data.get("case_context"),
                    "tenant_id": current_user.get("tenant_id"),
                    "created_by": current_user["id"],
                    "is_active": True,
                    "ai_generated": True,
                    "created_at": datetime.now(timezone.utc)
                }
                result = db.questions.insert_one(question)
                question["_id"] = result.inserted_id
                saved_questions.append(serialize_doc(question))
            
            return {
                "message": f"Successfully generated {len(saved_questions)} questions",
                "questions": saved_questions
            }
            
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@app.post("/api/ai/suggest-course")
async def suggest_course_ai(
    topic: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user)
):
    """Get AI-powered course suggestions"""
    if not AI_ENABLED or not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="AI service is not configured")
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        prompt = f"""Based on the topic "{topic}", suggest a comprehensive course outline with:
1. Course title
2. Course description (2-3 sentences)
3. Learning objectives (5 points)
4. Module breakdown (5-8 modules with topics)
5. Recommended duration in hours
6. Target audience
7. Prerequisites

Return as JSON with this structure:
{{
    "title": "Course Title",
    "description": "Description here",
    "objectives": ["obj1", "obj2", ...],
    "modules": [
        {{"name": "Module 1", "topics": ["topic1", "topic2"]}},
        ...
    ],
    "duration_hours": 40,
    "target_audience": "Description of target audience",
    "prerequisites": ["prerequisite1", "prerequisite2"]
}}"""

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"course-suggest-{current_user['id']}-{datetime.now().timestamp()}",
            system_message="You are an expert curriculum designer for online education."
        )
        chat.with_model("openai", "gpt-4o")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse response
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        course_suggestion = json.loads(response_text.strip())
        
        return course_suggestion
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

# ===========================================
# API ROUTES - DASHBOARD & ANALYTICS
# ===========================================

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    tenant_id = current_user.get("tenant_id")
    
    # Base stats
    stats = {
        "total_users": db.users.count_documents({"tenant_id": tenant_id}),
        "total_courses": db.courses.count_documents({"tenant_id": tenant_id, "is_published": True}),
        "total_exams": db.exams.count_documents({"tenant_id": tenant_id, "status": {"$ne": ExamStatus.DRAFT.value}}),
        "total_questions": db.questions.count_documents({"tenant_id": tenant_id, "is_active": True}),
        "total_attempts": db.exam_attempts.count_documents({"tenant_id": tenant_id}),
    }
    
    # Role-specific stats
    if current_user["role"] == UserRole.STUDENT.value:
        # Student-specific stats
        my_attempts = list(db.exam_attempts.find({"user_id": current_user["id"], "status": AttemptStatus.EVALUATED.value}))
        stats["my_exams_taken"] = len(my_attempts)
        stats["my_average_score"] = sum(a.get("percentage", 0) for a in my_attempts) / len(my_attempts) if my_attempts else 0
        stats["my_pass_rate"] = sum(1 for a in my_attempts if a.get("passed", False)) / len(my_attempts) * 100 if my_attempts else 0
        stats["my_xp_points"] = current_user.get("xp_points", 0)
        stats["my_level"] = current_user.get("level", 1)
        stats["my_streak"] = current_user.get("streak", 0)
    else:
        # Admin/Manager stats
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        stats["active_users_today"] = db.users.count_documents({"tenant_id": tenant_id, "last_login": {"$gte": today}})
        
        # Average score and pass rate
        all_attempts = list(db.exam_attempts.find({"tenant_id": tenant_id, "status": AttemptStatus.EVALUATED.value}))
        stats["average_score"] = sum(a.get("percentage", 0) for a in all_attempts) / len(all_attempts) if all_attempts else 0
        stats["pass_rate"] = sum(1 for a in all_attempts if a.get("passed", False)) / len(all_attempts) * 100 if all_attempts else 0
        
        # Recent enrollments (last 7 days)
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        stats["recent_enrollments"] = db.users.count_documents({
            "tenant_id": tenant_id,
            "role": UserRole.STUDENT.value,
            "created_at": {"$gte": week_ago}
        })
        
        # User breakdown by role
        stats["students_count"] = db.users.count_documents({"tenant_id": tenant_id, "role": UserRole.STUDENT.value})
        stats["teachers_count"] = db.users.count_documents({"tenant_id": tenant_id, "role": UserRole.TEACHER.value})
        stats["managers_count"] = db.users.count_documents({"tenant_id": tenant_id, "role": UserRole.MANAGER.value})
    
    return stats

@app.get("/api/dashboard/recent-activity")
async def get_recent_activity(
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """Get recent activity feed"""
    activities = []
    
    # Recent exam attempts
    if current_user["role"] == UserRole.STUDENT.value:
        attempts = list(db.exam_attempts.find(
            {"user_id": current_user["id"]}
        ).sort("started_at", DESCENDING).limit(limit))
    else:
        attempts = list(db.exam_attempts.find(
            {"tenant_id": current_user.get("tenant_id")}
        ).sort("started_at", DESCENDING).limit(limit))
    
    for attempt in attempts:
        exam = db.exams.find_one({"_id": ObjectId(attempt["exam_id"])}, {"title": 1})
        user = db.users.find_one({"_id": ObjectId(attempt["user_id"])}, {"name": 1, "avatar": 1})
        
        activities.append({
            "type": "exam_attempt",
            "user_name": user.get("name") if user else "Unknown",
            "user_avatar": user.get("avatar") if user else None,
            "exam_title": exam.get("title") if exam else "Unknown",
            "status": attempt.get("status"),
            "score": attempt.get("score"),
            "passed": attempt.get("passed"),
            "timestamp": attempt["started_at"].isoformat() if attempt.get("started_at") else None
        })
    
    return activities[:limit]

@app.get("/api/dashboard/performance-chart")
async def get_performance_chart(
    days: int = Query(30, ge=7, le=365),
    current_user: dict = Depends(get_current_user)
):
    """Get performance data for charts"""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    if current_user["role"] == UserRole.STUDENT.value:
        query = {"user_id": current_user["id"], "started_at": {"$gte": start_date}, "status": AttemptStatus.EVALUATED.value}
    else:
        query = {"tenant_id": current_user.get("tenant_id"), "started_at": {"$gte": start_date}, "status": AttemptStatus.EVALUATED.value}
    
    attempts = list(db.exam_attempts.find(query).sort("started_at", ASCENDING))
    
    # Group by date
    from collections import defaultdict
    daily_data = defaultdict(lambda: {"attempts": 0, "total_score": 0, "passed": 0})
    
    for attempt in attempts:
        date_key = attempt["started_at"].strftime("%Y-%m-%d")
        daily_data[date_key]["attempts"] += 1
        daily_data[date_key]["total_score"] += attempt.get("percentage", 0)
        if attempt.get("passed", False):
            daily_data[date_key]["passed"] += 1
    
    # Convert to chart format
    chart_data = []
    for date_str, data in sorted(daily_data.items()):
        chart_data.append({
            "date": date_str,
            "attempts": data["attempts"],
            "average_score": round(data["total_score"] / data["attempts"], 2) if data["attempts"] > 0 else 0,
            "pass_rate": round(data["passed"] / data["attempts"] * 100, 2) if data["attempts"] > 0 else 0
        })
    
    return chart_data

# ===========================================
# API ROUTES - TENANTS (Admin only)
# ===========================================

@app.get("/api/tenants")
async def get_tenants(current_user: dict = Depends(get_current_user)):
    """Get all tenants (Admin only)"""
    if current_user["role"] != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Access denied")
    
    tenants = list(db.tenants.find({}))
    return [serialize_doc(t) for t in tenants]

@app.post("/api/tenants", response_model=TenantResponse)
async def create_tenant(
    tenant_data: TenantCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new tenant (Admin only)"""
    if current_user["role"] != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Access denied")
    
    tenant = {
        **tenant_data.model_dump(),
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db.tenants.insert_one(tenant)
    tenant["_id"] = result.inserted_id
    
    return TenantResponse(**serialize_doc(tenant))

# ===========================================
# API ROUTES - LEADERBOARD
# ===========================================

@app.get("/api/leaderboard")
async def get_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get top students by XP points"""
    users = list(db.users.find(
        {"tenant_id": current_user.get("tenant_id"), "role": UserRole.STUDENT.value},
        {"password": 0}
    ).sort("xp_points", DESCENDING).limit(limit))
    
    leaderboard = []
    for i, user in enumerate(users, 1):
        leaderboard.append({
            "rank": i,
            **serialize_doc(user)
        })
    
    return leaderboard

# ===========================================
# RUN APPLICATION
# ===========================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
