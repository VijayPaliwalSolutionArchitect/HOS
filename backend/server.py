"""
EduExam Pro - Complete Backend API
===================================
Enterprise-grade Online Courses & Examination SaaS Platform

ARCHITECTURE:
- FastAPI with modular routes
- MongoDB with proper indexing
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Audit logging for compliance
- Multi-tenant data isolation

AI INTEGRATION:
- AI features are implemented but COMMENTED OUT
- See /app/docs/AI_INTEGRATION.md for configuration
- Manual workflows provided as fallback
"""

import os
import json
import random
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from enum import Enum
from bson import ObjectId

from fastapi import FastAPI, HTTPException, Depends, status, Query, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr
from pymongo import MongoClient, ASCENDING, DESCENDING
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

# ===========================================
# CONFIGURATION
# ===========================================

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "edtech_saas")
JWT_SECRET = os.environ.get("JWT_SECRET", "your-super-secret-jwt-key-change-in-production")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# AI Configuration (DISABLED BY DEFAULT - See docs/AI_INTEGRATION.md)
AI_ENABLED = os.environ.get("AI_ENABLED", "false").lower() == "true"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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

class SubscriptionPlan(str, Enum):
    FREE = "FREE"
    PRO = "PRO"
    INSTITUTION = "INSTITUTION"
    ENTERPRISE = "ENTERPRISE"

class SubscriptionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"
    TRIAL = "TRIAL"

class NotificationType(str, Enum):
    EXAM_ASSIGNED = "EXAM_ASSIGNED"
    EXAM_REMINDER = "EXAM_REMINDER"
    RESULT_PUBLISHED = "RESULT_PUBLISHED"
    COURSE_UPDATE = "COURSE_UPDATE"
    SYSTEM_ALERT = "SYSTEM_ALERT"
    PROMOTION = "PROMOTION"

class AuditAction(str, Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    EXAM_START = "EXAM_START"
    EXAM_SUBMIT = "EXAM_SUBMIT"
    PUBLISH = "PUBLISH"

# ===========================================
# PYDANTIC MODELS
# ===========================================

# --- Auth Models ---
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
    is_active: bool = True
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Tenant Models ---
class TenantCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    domain: Optional[str] = None
    logo: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    logo: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

# --- Subscription Models ---
class SubscriptionCreate(BaseModel):
    tenant_id: str
    plan: SubscriptionPlan = SubscriptionPlan.FREE
    status: SubscriptionStatus = SubscriptionStatus.TRIAL

# --- Category Models ---
class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[str] = None
    icon: Optional[str] = None
    order: int = 0

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[str] = None
    icon: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

# --- Course Models ---
class CourseCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str
    category_id: str
    thumbnail: Optional[str] = None
    duration_hours: Optional[int] = None
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    is_featured: bool = False
    tags: List[str] = []
    syllabus: Optional[List[Dict[str, Any]]] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    thumbnail: Optional[str] = None
    duration_hours: Optional[int] = None
    difficulty: Optional[DifficultyLevel] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None
    syllabus: Optional[List[Dict[str, Any]]] = None
    is_published: Optional[bool] = None

# --- Question Models ---
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
    case_context: Optional[str] = None
    blooms_level: Optional[str] = None  # Remember, Understand, Apply, Analyze, Evaluate, Create

class QuestionUpdate(BaseModel):
    category_id: Optional[str] = None
    type: Optional[QuestionType] = None
    text: Optional[str] = None
    options: Optional[List[Dict[str, Any]]] = None
    correct_answer: Optional[Any] = None
    explanation: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    marks: Optional[int] = None
    negative_marks: Optional[float] = None
    tags: Optional[List[str]] = None
    case_context: Optional[str] = None
    is_active: Optional[bool] = None

# --- Exam Models ---
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
    # Exam generation rules
    rules: Optional[Dict[str, Any]] = None  # {easy: 5, medium: 10, hard: 5}

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    duration_minutes: Optional[int] = None
    total_marks: Optional[int] = None
    passing_marks: Optional[int] = None
    instructions: Optional[str] = None
    shuffle_questions: Optional[bool] = None
    shuffle_options: Optional[bool] = None
    show_result_immediately: Optional[bool] = None
    allow_review: Optional[bool] = None
    negative_marking: Optional[bool] = None
    question_ids: Optional[List[str]] = None
    status: Optional[ExamStatus] = None

# --- Exam Attempt Models ---
class AnswerSubmit(BaseModel):
    question_id: str
    answer: Any
    time_spent_seconds: int = 0
    flagged: bool = False

class AttemptSubmit(BaseModel):
    answers: List[AnswerSubmit]

# --- Notification Models ---
class NotificationCreate(BaseModel):
    title: str
    message: str
    type: NotificationType
    target_role: Optional[UserRole] = None
    target_user_id: Optional[str] = None
    link: Optional[str] = None
    scheduled_at: Optional[datetime] = None

# --- AI Request Models (For future use) ---
class AIQuestionGenerate(BaseModel):
    category_id: str
    topic: str
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    question_type: QuestionType = QuestionType.MCQ_SINGLE
    count: int = Field(default=5, ge=1, le=20)
    blooms_level: Optional[str] = None
    exam_type: Optional[str] = None  # IELTS, Competitive, Academic, etc.

class AICourseGenerate(BaseModel):
    title: str
    audience: str
    duration_weeks: int
    difficulty: DifficultyLevel
    learning_style: Optional[str] = None

# ===========================================
# DATABASE & LIFECYCLE
# ===========================================

client: MongoClient = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Create indexes
    db.users.create_index([("email", ASCENDING)], unique=True)
    db.users.create_index([("tenant_id", ASCENDING)])
    db.users.create_index([("role", ASCENDING)])
    db.categories.create_index([("slug", ASCENDING), ("tenant_id", ASCENDING)])
    db.categories.create_index([("parent_id", ASCENDING)])
    db.courses.create_index([("category_id", ASCENDING)])
    db.courses.create_index([("is_published", ASCENDING)])
    db.questions.create_index([("category_id", ASCENDING), ("difficulty", ASCENDING)])
    db.questions.create_index([("tags", ASCENDING)])
    db.exams.create_index([("category_id", ASCENDING), ("status", ASCENDING)])
    db.exams.create_index([("version", ASCENDING)])
    db.exam_attempts.create_index([("user_id", ASCENDING), ("exam_id", ASCENDING)])
    db.audit_logs.create_index([("tenant_id", ASCENDING), ("created_at", DESCENDING)])
    db.notifications.create_index([("user_id", ASCENDING), ("is_read", ASCENDING)])
    
    await seed_default_data()
    print(f"✅ Connected to MongoDB: {DB_NAME}")
    yield
    client.close()
    print("❌ Disconnected from MongoDB")

# ===========================================
# FASTAPI APP
# ===========================================

app = FastAPI(
    title="EduExam Pro API",
    description="Enterprise-grade Online Courses & Examination SaaS Platform",
    version="2.0.0",
    lifespan=lifespan
)

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
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def serialize_doc(doc: dict) -> dict:
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

def log_audit(tenant_id: str, user_id: str, action: str, entity: str, entity_id: str = None, meta: dict = None):
    """Log an audit event - CRITICAL for compliance"""
    db.audit_logs.insert_one({
        "tenant_id": tenant_id,
        "user_id": user_id,
        "action": action,
        "entity": entity,
        "entity_id": entity_id,
        "meta": meta or {},
        "created_at": datetime.now(timezone.utc)
    })

def log_telemetry(tenant_id: str, user_id: str, event: str, payload: dict = None):
    """Log telemetry event for analytics"""
    db.telemetry_events.insert_one({
        "tenant_id": tenant_id,
        "user_id": user_id,
        "event": event,
        "payload": payload or {},
        "created_at": datetime.now(timezone.utc)
    })

# ===========================================
# AUTH DEPENDENCIES
# ===========================================

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return serialize_doc(user)

def require_roles(allowed_roles: List[UserRole]):
    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] not in [r.value for r in allowed_roles]:
            raise HTTPException(status_code=403, detail=f"Access denied. Required: {[r.value for r in allowed_roles]}")
        return current_user
    return role_checker

# ===========================================
# SEED DATA
# ===========================================

async def seed_default_data():
    if db.tenants.count_documents({}) == 0:
        # Create default tenant
        tenant = {
            "name": "Default Organization",
            "domain": "default",
            "logo": None,
            "settings": {"theme": "light", "language": "en"},
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        tenant_result = db.tenants.insert_one(tenant)
        tenant_id = str(tenant_result.inserted_id)
        
        # Create subscription
        db.subscriptions.insert_one({
            "tenant_id": tenant_id,
            "plan": SubscriptionPlan.ENTERPRISE.value,
            "status": SubscriptionStatus.ACTIVE.value,
            "features": {
                "max_users": -1,
                "max_exams": -1,
                "max_questions": -1,
                "ai_credits": 1000,
                "storage_gb": 100
            },
            "current_period_start": datetime.now(timezone.utc),
            "current_period_end": datetime.now(timezone.utc) + timedelta(days=365),
            "created_at": datetime.now(timezone.utc)
        })
        
        # Create users
        users_data = [
            {"name": "Admin User", "email": "admin@eduexam.com", "password": "admin123", "role": UserRole.ADMIN.value},
            {"name": "Manager User", "email": "manager@eduexam.com", "password": "manager123", "role": UserRole.MANAGER.value},
            {"name": "Teacher User", "email": "teacher@eduexam.com", "password": "teacher123", "role": UserRole.TEACHER.value},
            {"name": "Student User", "email": "student@eduexam.com", "password": "student123", "role": UserRole.STUDENT.value},
        ]
        
        teacher_id = None
        for u in users_data:
            user = {
                "name": u["name"],
                "email": u["email"],
                "password": hash_password(u["password"]),
                "role": u["role"],
                "tenant_id": tenant_id,
                "avatar": f"https://ui-avatars.com/api/?name={u['name'].replace(' ', '+')}&background=4F46E5&color=fff",
                "xp_points": random.randint(100, 5000),
                "level": random.randint(1, 10),
                "streak": random.randint(0, 30),
                "is_active": True,
                "created_at": datetime.now(timezone.utc)
            }
            result = db.users.insert_one(user)
            if u["role"] == UserRole.TEACHER.value:
                teacher_id = str(result.inserted_id)
        
        # Create categories with hierarchy
        categories_data = [
            {"name": "IELTS Preparation", "slug": "ielts", "icon": "📝", "children": [
                {"name": "Listening", "slug": "ielts-listening", "icon": "🎧"},
                {"name": "Reading", "slug": "ielts-reading", "icon": "📖"},
                {"name": "Writing", "slug": "ielts-writing", "icon": "✍️"},
                {"name": "Speaking", "slug": "ielts-speaking", "icon": "🗣️"},
            ]},
            {"name": "Mathematics", "slug": "mathematics", "icon": "📐", "children": [
                {"name": "Algebra", "slug": "math-algebra", "icon": "➕"},
                {"name": "Geometry", "slug": "math-geometry", "icon": "📏"},
                {"name": "Calculus", "slug": "math-calculus", "icon": "∫"},
            ]},
            {"name": "Science", "slug": "science", "icon": "🔬", "children": [
                {"name": "Physics", "slug": "science-physics", "icon": "⚛️"},
                {"name": "Chemistry", "slug": "science-chemistry", "icon": "🧪"},
                {"name": "Biology", "slug": "science-biology", "icon": "🧬"},
            ]},
            {"name": "Computer Science", "slug": "computer-science", "icon": "💻", "children": [
                {"name": "Programming", "slug": "cs-programming", "icon": "👨‍💻"},
                {"name": "Data Structures", "slug": "cs-data-structures", "icon": "🌳"},
                {"name": "Web Development", "slug": "cs-web-dev", "icon": "🌐"},
            ]},
            {"name": "Competitive Exams", "slug": "competitive", "icon": "🏆", "children": [
                {"name": "IAS/UPSC", "slug": "competitive-ias", "icon": "🇮🇳"},
                {"name": "Banking", "slug": "competitive-banking", "icon": "🏦"},
                {"name": "SSC", "slug": "competitive-ssc", "icon": "📋"},
            ]},
            {"name": "Corporate Training", "slug": "corporate", "icon": "🏢", "children": [
                {"name": "Leadership", "slug": "corporate-leadership", "icon": "👔"},
                {"name": "HR & Management", "slug": "corporate-hr", "icon": "👥"},
                {"name": "Technical Skills", "slug": "corporate-tech", "icon": "🛠️"},
            ]},
        ]
        
        category_ids = {}
        for cat in categories_data:
            parent = {
                "name": cat["name"],
                "slug": cat["slug"],
                "description": f"{cat['name']} courses and exams",
                "icon": cat["icon"],
                "parent_id": None,
                "order": 0,
                "tenant_id": tenant_id,
                "is_active": True,
                "created_at": datetime.now(timezone.utc)
            }
            result = db.categories.insert_one(parent)
            parent_id = str(result.inserted_id)
            category_ids[cat["slug"]] = parent_id
            
            for i, child in enumerate(cat.get("children", [])):
                child_doc = {
                    "name": child["name"],
                    "slug": child["slug"],
                    "description": f"{child['name']} content",
                    "icon": child["icon"],
                    "parent_id": parent_id,
                    "order": i,
                    "tenant_id": tenant_id,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc)
                }
                result = db.categories.insert_one(child_doc)
                category_ids[child["slug"]] = str(result.inserted_id)
        
        # Create sample courses
        courses_data = [
            {
                "title": "Complete IELTS Preparation Course",
                "description": "Master all four IELTS sections with comprehensive practice materials and mock tests.",
                "category_id": category_ids["ielts"],
                "thumbnail": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
                "duration_hours": 60,
                "difficulty": DifficultyLevel.MEDIUM.value,
                "is_featured": True,
                "tags": ["ielts", "english", "exam-prep"],
                "syllabus": [
                    {"week": 1, "title": "Introduction to IELTS", "topics": ["Format Overview", "Scoring System", "Time Management"]},
                    {"week": 2, "title": "Listening Skills", "topics": ["Note Taking", "Following Conversations", "Academic Lectures"]},
                    {"week": 3, "title": "Reading Strategies", "topics": ["Skimming", "Scanning", "True/False/NG"]},
                    {"week": 4, "title": "Writing Tasks", "topics": ["Task 1 Charts", "Task 2 Essays", "Grammar Focus"]},
                ],
                "enrollment_count": 1250,
                "rating": 4.8,
            },
            {
                "title": "Python Programming Fundamentals",
                "description": "Learn Python from scratch with hands-on projects and real-world applications.",
                "category_id": category_ids["cs-programming"],
                "thumbnail": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80",
                "duration_hours": 40,
                "difficulty": DifficultyLevel.EASY.value,
                "is_featured": True,
                "tags": ["python", "programming", "beginner"],
                "syllabus": [
                    {"week": 1, "title": "Getting Started", "topics": ["Installation", "First Program", "Variables"]},
                    {"week": 2, "title": "Control Flow", "topics": ["Conditions", "Loops", "Functions"]},
                ],
                "enrollment_count": 2100,
                "rating": 4.9,
            },
            {
                "title": "Advanced Mathematics for Competitive Exams",
                "description": "Complete math preparation for IAS, Banking, SSC and other competitive examinations.",
                "category_id": category_ids["mathematics"],
                "thumbnail": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
                "duration_hours": 80,
                "difficulty": DifficultyLevel.HARD.value,
                "is_featured": False,
                "tags": ["math", "competitive", "aptitude"],
                "syllabus": [],
                "enrollment_count": 890,
                "rating": 4.6,
            },
        ]
        
        for course in courses_data:
            course["tenant_id"] = tenant_id
            course["instructor_id"] = teacher_id
            course["is_published"] = True
            course["created_at"] = datetime.now(timezone.utc)
            db.courses.insert_one(course)
        
        # Create sample questions for IELTS
        questions_data = [
            {
                "category_id": category_ids["ielts-reading"],
                "type": QuestionType.MCQ_SINGLE.value,
                "text": "Choose the correct word to complete the sentence: The weather forecast _____ heavy rain tomorrow.",
                "options": [
                    {"id": "a", "text": "predicts"},
                    {"id": "b", "text": "predict"},
                    {"id": "c", "text": "predicting"},
                    {"id": "d", "text": "predicted"}
                ],
                "correct_answer": "a",
                "explanation": "'Predicts' is correct because the subject 'forecast' is singular and requires a singular verb in present tense.",
                "difficulty": DifficultyLevel.EASY.value,
                "marks": 1,
                "negative_marks": 0,
                "tags": ["grammar", "vocabulary"],
                "blooms_level": "Remember",
            },
            {
                "category_id": category_ids["ielts-reading"],
                "type": QuestionType.TRUE_FALSE.value,
                "text": "In IELTS Writing Task 2, you must always give your personal opinion regardless of the question type.",
                "options": [
                    {"id": "true", "text": "True"},
                    {"id": "false", "text": "False"}
                ],
                "correct_answer": "false",
                "explanation": "Not all Task 2 questions require personal opinion. Some ask to discuss both sides without stating your view.",
                "difficulty": DifficultyLevel.MEDIUM.value,
                "marks": 1,
                "negative_marks": 0,
                "tags": ["writing", "strategy"],
                "blooms_level": "Understand",
            },
            {
                "category_id": category_ids["ielts-listening"],
                "type": QuestionType.MCQ_MULTI.value,
                "text": "Select ALL the correct strategies for improving IELTS listening score:",
                "options": [
                    {"id": "a", "text": "Practice with various English accents"},
                    {"id": "b", "text": "Only listen to British English"},
                    {"id": "c", "text": "Read ahead while listening"},
                    {"id": "d", "text": "Predict answers before listening"}
                ],
                "correct_answer": ["a", "c", "d"],
                "explanation": "IELTS features various accents, reading ahead helps anticipate, and predicting answers is a key strategy.",
                "difficulty": DifficultyLevel.MEDIUM.value,
                "marks": 2,
                "negative_marks": 0.5,
                "tags": ["listening", "strategy"],
                "blooms_level": "Apply",
            },
            {
                "category_id": category_ids["ielts-reading"],
                "type": QuestionType.FILL_BLANK.value,
                "text": "Complete the sentence: The IELTS test has four sections: Listening, Reading, Writing, and _____.",
                "options": None,
                "correct_answer": "Speaking",
                "explanation": "The four sections of IELTS are Listening, Reading, Writing, and Speaking.",
                "difficulty": DifficultyLevel.EASY.value,
                "marks": 1,
                "negative_marks": 0,
                "tags": ["basics", "format"],
                "blooms_level": "Remember",
            },
            {
                "category_id": category_ids["ielts-reading"],
                "type": QuestionType.CASE_BASED.value,
                "text": "Based on the passage, what is the main argument presented by the author?",
                "case_context": "Climate change represents one of the most significant challenges facing humanity today. Scientists worldwide have reached a consensus that human activities, particularly the burning of fossil fuels, are the primary cause of global warming. The consequences of inaction could be catastrophic, including rising sea levels, extreme weather events, and widespread biodiversity loss. However, there is still time to mitigate these effects through collective action and policy changes.",
                "options": [
                    {"id": "a", "text": "Climate change is a natural phenomenon"},
                    {"id": "b", "text": "Human activities are causing global warming and action is needed"},
                    {"id": "c", "text": "Scientists disagree about climate change causes"},
                    {"id": "d", "text": "It is too late to address climate change"}
                ],
                "correct_answer": "b",
                "explanation": "The passage clearly states humans are the 'primary cause' and emphasizes 'there is still time' for action.",
                "difficulty": DifficultyLevel.HARD.value,
                "marks": 3,
                "negative_marks": 0.75,
                "tags": ["reading", "comprehension", "analysis"],
                "blooms_level": "Analyze",
            },
            # Math questions
            {
                "category_id": category_ids["math-algebra"],
                "type": QuestionType.MCQ_SINGLE.value,
                "text": "Solve for x: 2x + 5 = 15",
                "options": [
                    {"id": "a", "text": "x = 5"},
                    {"id": "b", "text": "x = 10"},
                    {"id": "c", "text": "x = 7.5"},
                    {"id": "d", "text": "x = 20"}
                ],
                "correct_answer": "a",
                "explanation": "2x + 5 = 15 → 2x = 10 → x = 5",
                "difficulty": DifficultyLevel.EASY.value,
                "marks": 1,
                "negative_marks": 0.25,
                "tags": ["algebra", "linear-equations"],
                "blooms_level": "Apply",
            },
            {
                "category_id": category_ids["cs-programming"],
                "type": QuestionType.MCQ_SINGLE.value,
                "text": "What is the output of: print(type([1, 2, 3]))",
                "options": [
                    {"id": "a", "text": "<class 'tuple'>"},
                    {"id": "b", "text": "<class 'list'>"},
                    {"id": "c", "text": "<class 'array'>"},
                    {"id": "d", "text": "<class 'set'>"}
                ],
                "correct_answer": "b",
                "explanation": "[1, 2, 3] creates a list in Python, so type() returns <class 'list'>",
                "difficulty": DifficultyLevel.EASY.value,
                "marks": 1,
                "negative_marks": 0,
                "tags": ["python", "data-types"],
                "blooms_level": "Remember",
            },
        ]
        
        question_ids = []
        for q in questions_data:
            q["tenant_id"] = tenant_id
            q["created_by"] = teacher_id
            q["is_active"] = True
            q["is_ai_generated"] = False
            q["created_at"] = datetime.now(timezone.utc)
            result = db.questions.insert_one(q)
            question_ids.append(str(result.inserted_id))
        
        # Create sample exam
        exam = {
            "title": "IELTS Practice Test - Reading & Listening",
            "description": "A comprehensive practice test covering reading comprehension and listening skills for IELTS preparation.",
            "category_id": category_ids["ielts"],
            "duration_minutes": 45,
            "total_marks": 10,
            "passing_marks": 6,
            "instructions": """
            <h3>Instructions:</h3>
            <ul>
                <li>Read each question carefully before answering</li>
                <li>You can navigate between questions using the panel on the right</li>
                <li>Mark questions for review if you're unsure</li>
                <li>Time will be shown at the top - exam auto-submits when time expires</li>
                <li>Negative marking applies to some questions</li>
            </ul>
            """,
            "shuffle_questions": True,
            "shuffle_options": True,
            "show_result_immediately": True,
            "allow_review": True,
            "negative_marking": True,
            "question_ids": question_ids[:5],  # First 5 IELTS questions
            "rules": {"easy": 2, "medium": 2, "hard": 1},
            "version": 1,
            "status": ExamStatus.PUBLISHED.value,
            "tenant_id": tenant_id,
            "created_by": teacher_id,
            "created_at": datetime.now(timezone.utc)
        }
        db.exams.insert_one(exam)
        
        # Create welcome notification
        db.notifications.insert_one({
            "tenant_id": tenant_id,
            "user_id": None,  # All users
            "title": "Welcome to EduExam Pro! 🎉",
            "message": "Start your learning journey today. Explore courses, take practice exams, and track your progress.",
            "type": NotificationType.SYSTEM_ALERT.value,
            "link": "/student/dashboard",
            "is_read": False,
            "created_at": datetime.now(timezone.utc)
        })
        
        print("✅ Default data seeded successfully")

# ===========================================
# API ROUTES - HEALTH
# ===========================================

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "EduExam Pro API",
        "version": "2.0.0",
        "ai_enabled": AI_ENABLED,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ===========================================
# API ROUTES - AUTHENTICATION
# ===========================================

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    if db.users.find_one({"email": user_data.email.lower()}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    tenant = db.tenants.find_one({"domain": "default"})
    tenant_id = str(tenant["_id"]) if tenant else None
    
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
    
    log_audit(tenant_id, str(result.inserted_id), AuditAction.CREATE.value, "user", str(result.inserted_id))
    
    user_response = serialize_doc(user)
    del user_response["password"]
    
    return TokenResponse(
        access_token=create_access_token({"sub": str(result.inserted_id)}),
        refresh_token=create_refresh_token({"sub": str(result.inserted_id)}),
        user=UserResponse(**user_response)
    )

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = db.users.find_one({"email": credentials.email.lower()})
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.now(timezone.utc)}})
    log_audit(user.get("tenant_id"), str(user["_id"]), AuditAction.LOGIN.value, "user", str(user["_id"]))
    
    user_response = serialize_doc(user)
    del user_response["password"]
    
    return TokenResponse(
        access_token=create_access_token({"sub": str(user["_id"])}),
        refresh_token=create_refresh_token({"sub": str(user["_id"])}),
        user=UserResponse(**user_response)
    )

@app.post("/api/auth/refresh")
async def refresh_token(refresh_token: str = Body(..., embed=True)):
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    user = db.users.find_one({"_id": ObjectId(payload.get("sub"))})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {"access_token": create_access_token({"sub": payload.get("sub")}), "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# ===========================================
# API ROUTES - USERS (CRUD)
# ===========================================

@app.get("/api/users")
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER]))
):
    """Get all users with filters (Admin/Manager only)"""
    query = {"tenant_id": current_user.get("tenant_id")}
    if role:
        query["role"] = role.value
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    if is_active is not None:
        query["is_active"] = is_active
    
    users = list(db.users.find(query, {"password": 0}).skip(skip).limit(limit).sort("created_at", DESCENDING))
    total = db.users.count_documents(query)
    
    return {"users": [serialize_doc(u) for u in users], "total": total, "skip": skip, "limit": limit}

@app.get("/api/users/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get user by ID"""
    if user_id != current_user["id"] and current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return serialize_doc(user)

@app.put("/api/users/{user_id}")
async def update_user(user_id: str, updates: dict = Body(...), current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    if user_id != current_user["id"] and current_user["role"] != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Protect sensitive fields
    protected = ["password", "email", "role", "tenant_id", "_id"]
    for field in protected:
        updates.pop(field, None)
    
    # Only admin can change role
    if "role" in updates and current_user["role"] == UserRole.ADMIN.value:
        updates["role"] = updates["role"]
    
    updates["updated_at"] = datetime.now(timezone.utc)
    
    result = db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.UPDATE.value, "user", user_id)
    
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    return serialize_doc(user)

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_roles([UserRole.ADMIN]))):
    """Soft delete user (Admin only)"""
    result = db.users.update_one(
        {"_id": ObjectId(user_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": {"is_active": False, "deleted_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.DELETE.value, "user", user_id)
    return {"message": "User deactivated successfully"}

# ===========================================
# API ROUTES - TENANTS (CRUD)
# ===========================================

@app.get("/api/tenants")
async def get_tenants(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    """Get all tenants (Admin only)"""
    tenants = list(db.tenants.find({}).skip(skip).limit(limit).sort("created_at", DESCENDING))
    total = db.tenants.count_documents({})
    return {"tenants": [serialize_doc(t) for t in tenants], "total": total}

@app.get("/api/tenants/{tenant_id}")
async def get_tenant(tenant_id: str, current_user: dict = Depends(require_roles([UserRole.ADMIN]))):
    """Get tenant by ID"""
    tenant = db.tenants.find_one({"_id": ObjectId(tenant_id)})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return serialize_doc(tenant)

@app.post("/api/tenants")
async def create_tenant(tenant_data: TenantCreate, current_user: dict = Depends(require_roles([UserRole.ADMIN]))):
    """Create new tenant (Admin only)"""
    tenant = {
        **tenant_data.model_dump(),
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    result = db.tenants.insert_one(tenant)
    tenant["_id"] = result.inserted_id
    
    # Create default subscription
    db.subscriptions.insert_one({
        "tenant_id": str(result.inserted_id),
        "plan": SubscriptionPlan.FREE.value,
        "status": SubscriptionStatus.TRIAL.value,
        "features": {"max_users": 10, "max_exams": 5, "ai_credits": 100},
        "current_period_start": datetime.now(timezone.utc),
        "current_period_end": datetime.now(timezone.utc) + timedelta(days=14),
        "created_at": datetime.now(timezone.utc)
    })
    
    log_audit(str(result.inserted_id), current_user["id"], AuditAction.CREATE.value, "tenant", str(result.inserted_id))
    return serialize_doc(tenant)

@app.put("/api/tenants/{tenant_id}")
async def update_tenant(tenant_id: str, updates: TenantUpdate, current_user: dict = Depends(require_roles([UserRole.ADMIN]))):
    """Update tenant (Admin only)"""
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = db.tenants.update_one({"_id": ObjectId(tenant_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    log_audit(tenant_id, current_user["id"], AuditAction.UPDATE.value, "tenant", tenant_id)
    tenant = db.tenants.find_one({"_id": ObjectId(tenant_id)})
    return serialize_doc(tenant)

@app.delete("/api/tenants/{tenant_id}")
async def delete_tenant(tenant_id: str, current_user: dict = Depends(require_roles([UserRole.ADMIN]))):
    """Deactivate tenant (Admin only)"""
    result = db.tenants.update_one(
        {"_id": ObjectId(tenant_id)},
        {"$set": {"is_active": False, "deleted_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    log_audit(tenant_id, current_user["id"], AuditAction.DELETE.value, "tenant", tenant_id)
    return {"message": "Tenant deactivated successfully"}

# ===========================================
# API ROUTES - SUBSCRIPTIONS
# ===========================================

@app.get("/api/subscriptions")
async def get_subscriptions(current_user: dict = Depends(require_roles([UserRole.ADMIN]))):
    """Get all subscriptions (Admin only)"""
    subscriptions = list(db.subscriptions.find({}))
    return [serialize_doc(s) for s in subscriptions]

@app.get("/api/subscriptions/current")
async def get_current_subscription(current_user: dict = Depends(get_current_user)):
    """Get current tenant's subscription"""
    subscription = db.subscriptions.find_one({"tenant_id": current_user.get("tenant_id")})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return serialize_doc(subscription)

@app.put("/api/subscriptions/{subscription_id}")
async def update_subscription(
    subscription_id: str,
    updates: dict = Body(...),
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    """Update subscription (Admin only)"""
    updates["updated_at"] = datetime.now(timezone.utc)
    
    result = db.subscriptions.update_one({"_id": ObjectId(subscription_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    subscription = db.subscriptions.find_one({"_id": ObjectId(subscription_id)})
    return serialize_doc(subscription)

# ===========================================
# API ROUTES - CATEGORIES (CRUD)
# ===========================================

@app.get("/api/categories")
async def get_categories(
    include_inactive: bool = False,
    parent_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all categories with optional hierarchy filter"""
    query = {"tenant_id": current_user.get("tenant_id")}
    if not include_inactive:
        query["is_active"] = True
    if parent_id is not None:
        query["parent_id"] = parent_id if parent_id != "null" else None
    
    categories = list(db.categories.find(query).sort("order", ASCENDING))
    return [serialize_doc(c) for c in categories]

@app.get("/api/categories/tree")
async def get_categories_tree(current_user: dict = Depends(get_current_user)):
    """Get categories as a hierarchical tree"""
    query = {"tenant_id": current_user.get("tenant_id"), "is_active": True}
    categories = list(db.categories.find(query).sort("order", ASCENDING))
    
    # Build tree structure
    cat_map = {str(c["_id"]): {**serialize_doc(c), "children": []} for c in categories}
    tree = []
    
    for cat in categories:
        cat_id = str(cat["_id"])
        parent_id = cat.get("parent_id")
        
        if parent_id and parent_id in cat_map:
            cat_map[parent_id]["children"].append(cat_map[cat_id])
        elif not parent_id:
            tree.append(cat_map[cat_id])
    
    return tree

@app.get("/api/categories/{category_id}")
async def get_category(category_id: str, current_user: dict = Depends(get_current_user)):
    """Get category by ID"""
    category = db.categories.find_one({"_id": ObjectId(category_id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return serialize_doc(category)

@app.post("/api/categories")
async def create_category(
    category_data: CategoryCreate,
    current_user: dict = Depends(require_roles([UserRole.MANAGER, UserRole.ADMIN]))
):
    """Create new category"""
    # Check for duplicate slug
    if db.categories.find_one({"slug": category_data.slug, "tenant_id": current_user.get("tenant_id")}):
        raise HTTPException(status_code=400, detail="Category with this slug already exists")
    
    category = {
        **category_data.model_dump(),
        "tenant_id": current_user.get("tenant_id"),
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    result = db.categories.insert_one(category)
    category["_id"] = result.inserted_id
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.CREATE.value, "category", str(result.inserted_id))
    return serialize_doc(category)

@app.put("/api/categories/{category_id}")
async def update_category(
    category_id: str,
    updates: CategoryUpdate,
    current_user: dict = Depends(require_roles([UserRole.MANAGER, UserRole.ADMIN]))
):
    """Update category"""
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = db.categories.update_one(
        {"_id": ObjectId(category_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.UPDATE.value, "category", category_id)
    category = db.categories.find_one({"_id": ObjectId(category_id)})
    return serialize_doc(category)

@app.delete("/api/categories/{category_id}")
async def delete_category(
    category_id: str,
    current_user: dict = Depends(require_roles([UserRole.MANAGER, UserRole.ADMIN]))
):
    """Soft delete category (disables it)"""
    # Check for children
    children = db.categories.count_documents({"parent_id": category_id, "is_active": True})
    if children > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category with active children")
    
    result = db.categories.update_one(
        {"_id": ObjectId(category_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": {"is_active": False, "deleted_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.DELETE.value, "category", category_id)
    return {"message": "Category disabled successfully"}

# ===========================================
# API ROUTES - COURSES (CRUD)
# ===========================================

@app.get("/api/courses")
async def get_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_published: Optional[bool] = True,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get courses with filters"""
    query = {"tenant_id": current_user.get("tenant_id")}
    
    # Students only see published courses
    if current_user["role"] == UserRole.STUDENT.value:
        query["is_published"] = True
    elif is_published is not None:
        query["is_published"] = is_published
    
    if category_id:
        query["category_id"] = category_id
    if is_featured is not None:
        query["is_featured"] = is_featured
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$in": [search.lower()]}}
        ]
    
    courses = list(db.courses.find(query).skip(skip).limit(limit).sort("created_at", DESCENDING))
    total = db.courses.count_documents(query)
    
    # Enrich with instructor names and category
    for course in courses:
        instructor = db.users.find_one({"_id": ObjectId(course.get("instructor_id"))}, {"name": 1})
        course["instructor_name"] = instructor.get("name") if instructor else "Unknown"
        category = db.categories.find_one({"_id": ObjectId(course.get("category_id"))}, {"name": 1})
        course["category_name"] = category.get("name") if category else "Unknown"
    
    return {"courses": [serialize_doc(c) for c in courses], "total": total, "skip": skip, "limit": limit}

@app.get("/api/courses/{course_id}")
async def get_course(course_id: str, current_user: dict = Depends(get_current_user)):
    """Get course by ID"""
    course = db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    instructor = db.users.find_one({"_id": ObjectId(course.get("instructor_id"))}, {"name": 1, "avatar": 1})
    course["instructor_name"] = instructor.get("name") if instructor else "Unknown"
    course["instructor_avatar"] = instructor.get("avatar") if instructor else None
    
    category = db.categories.find_one({"_id": ObjectId(course.get("category_id"))}, {"name": 1})
    course["category_name"] = category.get("name") if category else "Unknown"
    
    return serialize_doc(course)

@app.post("/api/courses")
async def create_course(
    course_data: CourseCreate,
    current_user: dict = Depends(require_roles([UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN]))
):
    """Create new course"""
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
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.CREATE.value, "course", str(result.inserted_id))
    return serialize_doc(course)

@app.put("/api/courses/{course_id}")
async def update_course(
    course_id: str,
    updates: CourseUpdate,
    current_user: dict = Depends(require_roles([UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN]))
):
    """Update course"""
    course = db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Only instructor or admin can update
    if course["instructor_id"] != current_user["id"] and current_user["role"] != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    db.courses.update_one({"_id": ObjectId(course_id)}, {"$set": update_data})
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.UPDATE.value, "course", course_id)
    
    updated = db.courses.find_one({"_id": ObjectId(course_id)})
    return serialize_doc(updated)

@app.post("/api/courses/{course_id}/publish")
async def publish_course(
    course_id: str,
    current_user: dict = Depends(require_roles([UserRole.MANAGER, UserRole.ADMIN]))
):
    """Publish course"""
    result = db.courses.update_one(
        {"_id": ObjectId(course_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": {"is_published": True, "published_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.PUBLISH.value, "course", course_id)
    return {"message": "Course published successfully"}

@app.delete("/api/courses/{course_id}")
async def delete_course(
    course_id: str,
    current_user: dict = Depends(require_roles([UserRole.MANAGER, UserRole.ADMIN]))
):
    """Soft delete course"""
    result = db.courses.update_one(
        {"_id": ObjectId(course_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": {"is_published": False, "deleted_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.DELETE.value, "course", course_id)
    return {"message": "Course deleted successfully"}

# ===========================================
# API ROUTES - QUESTIONS (CRUD)
# ===========================================

@app.get("/api/questions")
async def get_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[str] = None,
    difficulty: Optional[DifficultyLevel] = None,
    question_type: Optional[QuestionType] = None,
    search: Optional[str] = None,
    is_ai_generated: Optional[bool] = None,
    current_user: dict = Depends(require_roles([UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN]))
):
    """Get questions with filters"""
    query = {"tenant_id": current_user.get("tenant_id"), "is_active": True}
    
    if category_id:
        query["category_id"] = category_id
    if difficulty:
        query["difficulty"] = difficulty.value
    if question_type:
        query["type"] = question_type.value
    if search:
        query["text"] = {"$regex": search, "$options": "i"}
    if is_ai_generated is not None:
        query["is_ai_generated"] = is_ai_generated
    
    questions = list(db.questions.find(query).skip(skip).limit(limit).sort("created_at", DESCENDING))
    total = db.questions.count_documents(query)
    
    # Enrich with category names
    for q in questions:
        category = db.categories.find_one({"_id": ObjectId(q.get("category_id"))}, {"name": 1})
        q["category_name"] = category.get("name") if category else "Unknown"
    
    return {"questions": [serialize_doc(q) for q in questions], "total": total, "skip": skip, "limit": limit}

@app.get("/api/questions/stats")
async def get_questions_stats(
    current_user: dict = Depends(require_roles([UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN]))
):
    """Get question bank statistics"""
    tenant_id = current_user.get("tenant_id")
    
    total = db.questions.count_documents({"tenant_id": tenant_id, "is_active": True})
    by_difficulty = db.questions.aggregate([
        {"$match": {"tenant_id": tenant_id, "is_active": True}},
        {"$group": {"_id": "$difficulty", "count": {"$sum": 1}}}
    ])
    by_type = db.questions.aggregate([
        {"$match": {"tenant_id": tenant_id, "is_active": True}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}}
    ])
    ai_generated = db.questions.count_documents({"tenant_id": tenant_id, "is_active": True, "is_ai_generated": True})
    
    return {
        "total": total,
        "by_difficulty": {item["_id"]: item["count"] for item in by_difficulty},
        "by_type": {item["_id"]: item["count"] for item in by_type},
        "ai_generated": ai_generated,
        "manual": total - ai_generated
    }

@app.get("/api/questions/{question_id}")
async def get_question(
    question_id: str,
    current_user: dict = Depends(require_roles([UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN]))
):
    """Get question by ID"""
    question = db.questions.find_one({"_id": ObjectId(question_id)})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return serialize_doc(question)

@app.post("/api/questions")
async def create_question(
    question_data: QuestionCreate,
    current_user: dict = Depends(require_roles([UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN]))
):
    """Create new question"""
    question = {
        **question_data.model_dump(),
        "tenant_id": current_user.get("tenant_id"),
        "created_by": current_user["id"],
        "is_active": True,
        "is_ai_generated": False,
        "created_at": datetime.now(timezone.utc)
    }
    result = db.questions.insert_one(question)
    question["_id"] = result.inserted_id
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.CREATE.value, "question", str(result.inserted_id))
    return serialize_doc(question)

@app.post("/api/questions/bulk")
async def create_questions_bulk(
    questions: List[QuestionCreate],
    current_user: dict = Depends(require_roles([UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN]))
):
    """Create multiple questions at once"""
    docs = []
    for q in questions:
        docs.append({
            **q.model_dump(),
            "tenant_id": current_user.get("tenant_id"),
            "created_by": current_user["id"],
            "is_active": True,
            "is_ai_generated": False,
            "created_at": datetime.now(timezone.utc)
        })
    
    result = db.questions.insert_many(docs)
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.CREATE.value, "questions", None, {"count": len(docs)})
    return {"message": f"Created {len(result.inserted_ids)} questions", "count": len(result.inserted_ids)}

@app.put("/api/questions/{question_id}")
async def update_question(
    question_id: str,
    updates: QuestionUpdate,
    current_user: dict = Depends(require_roles([UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN]))
):
    """Update question"""
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = db.questions.update_one(
        {"_id": ObjectId(question_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.UPDATE.value, "question", question_id)
    question = db.questions.find_one({"_id": ObjectId(question_id)})
    return serialize_doc(question)

@app.delete("/api/questions/{question_id}")
async def delete_question(
    question_id: str,
    current_user: dict = Depends(require_roles([UserRole.MANAGER, UserRole.ADMIN]))
):
    """Soft delete question"""
    result = db.questions.update_one(
        {"_id": ObjectId(question_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": {"is_active": False, "deleted_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.DELETE.value, "question", question_id)
    return {"message": "Question deleted successfully"}

# ===========================================
# API ROUTES - EXAMS (CRUD)
# ===========================================

@app.get("/api/exams")
async def get_exams(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[str] = None,
    status: Optional[ExamStatus] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get exams with filters"""
    query = {"tenant_id": current_user.get("tenant_id")}
    
    # Students only see published/active exams
    if current_user["role"] == UserRole.STUDENT.value:
        query["status"] = {"$in": [ExamStatus.PUBLISHED.value, ExamStatus.ACTIVE.value]}
    elif status:
        query["status"] = status.value
    
    if category_id:
        query["category_id"] = category_id
    
    exams = list(db.exams.find(query).skip(skip).limit(limit).sort("created_at", DESCENDING))
    total = db.exams.count_documents(query)
    
    for exam in exams:
        exam["question_count"] = len(exam.get("question_ids", []))
        category = db.categories.find_one({"_id": ObjectId(exam.get("category_id"))}, {"name": 1})
        exam["category_name"] = category.get("name") if category else "Unknown"
    
    return {"exams": [serialize_doc(e) for e in exams], "total": total, "skip": skip, "limit": limit}

@app.get("/api/exams/{exam_id}")
async def get_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Get exam by ID"""
    exam = db.exams.find_one({"_id": ObjectId(exam_id)})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    exam["question_count"] = len(exam.get("question_ids", []))
    category = db.categories.find_one({"_id": ObjectId(exam.get("category_id"))}, {"name": 1})
    exam["category_name"] = category.get("name") if category else "Unknown"
    
    return serialize_doc(exam)

@app.post("/api/exams")
async def create_exam(
    exam_data: ExamCreate,
    current_user: dict = Depends(require_roles([UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN]))
):
    """Create new exam"""
    # Calculate total marks from questions
    total_marks = 0
    if exam_data.question_ids:
        questions = list(db.questions.find({"_id": {"$in": [ObjectId(qid) for qid in exam_data.question_ids]}}))
        total_marks = sum(q.get("marks", 1) for q in questions)
    
    exam = {
        **exam_data.model_dump(),
        "total_marks": total_marks or exam_data.total_marks,
        "tenant_id": current_user.get("tenant_id"),
        "created_by": current_user["id"],
        "status": ExamStatus.DRAFT.value,
        "version": 1,
        "created_at": datetime.now(timezone.utc)
    }
    result = db.exams.insert_one(exam)
    exam["_id"] = result.inserted_id
    exam["question_count"] = len(exam.get("question_ids", []))
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.CREATE.value, "exam", str(result.inserted_id))
    return serialize_doc(exam)

@app.put("/api/exams/{exam_id}")
async def update_exam(
    exam_id: str,
    updates: ExamUpdate,
    current_user: dict = Depends(require_roles([UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN]))
):
    """Update exam (creates new version if published)"""
    exam = db.exams.find_one({"_id": ObjectId(exam_id)})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    # If exam is published and questions change, create new version
    if exam["status"] != ExamStatus.DRAFT.value and "question_ids" in update_data:
        # Create new version
        new_exam = {**exam}
        new_exam.pop("_id")
        new_exam.update(update_data)
        new_exam["version"] = exam["version"] + 1
        new_exam["status"] = ExamStatus.DRAFT.value
        new_exam["created_at"] = datetime.now(timezone.utc)
        
        result = db.exams.insert_one(new_exam)
        new_exam["_id"] = result.inserted_id
        new_exam["question_count"] = len(new_exam.get("question_ids", []))
        
        log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.CREATE.value, "exam", str(result.inserted_id), {"new_version": new_exam["version"]})
        return serialize_doc(new_exam)
    
    # Regular update
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    # Recalculate total marks if questions changed
    if "question_ids" in update_data:
        questions = list(db.questions.find({"_id": {"$in": [ObjectId(qid) for qid in update_data["question_ids"]]}}))
        update_data["total_marks"] = sum(q.get("marks", 1) for q in questions)
    
    db.exams.update_one({"_id": ObjectId(exam_id)}, {"$set": update_data})
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.UPDATE.value, "exam", exam_id)
    
    updated = db.exams.find_one({"_id": ObjectId(exam_id)})
    updated["question_count"] = len(updated.get("question_ids", []))
    return serialize_doc(updated)

@app.post("/api/exams/{exam_id}/publish")
async def publish_exam(
    exam_id: str,
    current_user: dict = Depends(require_roles([UserRole.MANAGER, UserRole.ADMIN]))
):
    """Publish exam - makes it available to students"""
    exam = db.exams.find_one({"_id": ObjectId(exam_id)})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    if len(exam.get("question_ids", [])) == 0:
        raise HTTPException(status_code=400, detail="Cannot publish exam without questions")
    
    db.exams.update_one(
        {"_id": ObjectId(exam_id)},
        {"$set": {"status": ExamStatus.PUBLISHED.value, "published_at": datetime.now(timezone.utc)}}
    )
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.PUBLISH.value, "exam", exam_id)
    return {"message": "Exam published successfully"}

@app.post("/api/exams/{exam_id}/archive")
async def archive_exam(
    exam_id: str,
    current_user: dict = Depends(require_roles([UserRole.MANAGER, UserRole.ADMIN]))
):
    """Archive exam"""
    result = db.exams.update_one(
        {"_id": ObjectId(exam_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": {"status": ExamStatus.ARCHIVED.value, "archived_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    return {"message": "Exam archived successfully"}

@app.delete("/api/exams/{exam_id}")
async def delete_exam(
    exam_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    """Delete exam (Admin only, soft delete)"""
    result = db.exams.update_one(
        {"_id": ObjectId(exam_id), "tenant_id": current_user.get("tenant_id")},
        {"$set": {"status": ExamStatus.ARCHIVED.value, "deleted_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.DELETE.value, "exam", exam_id)
    return {"message": "Exam deleted successfully"}

# ===========================================
# API ROUTES - EXAM ATTEMPTS
# ===========================================

@app.post("/api/exams/{exam_id}/start")
async def start_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Start exam attempt"""
    exam = db.exams.find_one({"_id": ObjectId(exam_id)})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    if exam["status"] not in [ExamStatus.PUBLISHED.value, ExamStatus.ACTIVE.value]:
        raise HTTPException(status_code=400, detail="Exam is not available")
    
    # Check for existing in-progress attempt
    existing = db.exam_attempts.find_one({
        "exam_id": exam_id,
        "user_id": current_user["id"],
        "status": AttemptStatus.IN_PROGRESS.value
    })
    
    if existing:
        # Resume existing attempt
        questions = list(db.questions.find(
            {"_id": {"$in": [ObjectId(qid) for qid in exam["question_ids"]]}},
            {"correct_answer": 0, "explanation": 0}
        ))
        
        time_elapsed = (datetime.now(timezone.utc) - existing["started_at"]).seconds
        time_remaining = max(0, exam["duration_minutes"] * 60 - time_elapsed)
        
        return {
            "attempt_id": str(existing["_id"]),
            "exam": serialize_doc(exam),
            "questions": [serialize_doc(q) for q in questions],
            "started_at": existing["started_at"].isoformat(),
            "time_remaining_seconds": time_remaining,
            "saved_answers": existing.get("answers", [])
        }
    
    # Create new attempt
    attempt = {
        "exam_id": exam_id,
        "exam_version": exam.get("version", 1),
        "user_id": current_user["id"],
        "tenant_id": current_user.get("tenant_id"),
        "status": AttemptStatus.IN_PROGRESS.value,
        "answers": [],
        "started_at": datetime.now(timezone.utc)
    }
    result = db.exam_attempts.insert_one(attempt)
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.EXAM_START.value, "exam_attempt", str(result.inserted_id))
    log_telemetry(current_user.get("tenant_id"), current_user["id"], "EXAM_STARTED", {"exam_id": exam_id})
    
    # Get questions (hide answers)
    questions = list(db.questions.find(
        {"_id": {"$in": [ObjectId(qid) for qid in exam["question_ids"]]}},
        {"correct_answer": 0, "explanation": 0}
    ))
    
    # Shuffle if enabled
    if exam.get("shuffle_questions", True):
        random.shuffle(questions)
    
    return {
        "attempt_id": str(result.inserted_id),
        "exam": serialize_doc(exam),
        "questions": [serialize_doc(q) for q in questions],
        "started_at": attempt["started_at"].isoformat(),
        "time_remaining_seconds": exam["duration_minutes"] * 60,
        "saved_answers": []
    }

@app.post("/api/attempts/{attempt_id}/sync")
async def sync_answers(
    attempt_id: str,
    answers: List[AnswerSubmit],
    current_user: dict = Depends(get_current_user)
):
    """Sync answers during exam (periodic save)"""
    attempt = db.exam_attempts.find_one({"_id": ObjectId(attempt_id)})
    if not attempt or attempt["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt["status"] != AttemptStatus.IN_PROGRESS.value:
        raise HTTPException(status_code=400, detail="Attempt already submitted")
    
    db.exam_attempts.update_one(
        {"_id": ObjectId(attempt_id)},
        {"$set": {"answers": [a.model_dump() for a in answers], "last_sync": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Answers synced", "synced_count": len(answers)}

@app.post("/api/attempts/{attempt_id}/submit")
async def submit_exam(
    attempt_id: str,
    submission: AttemptSubmit,
    current_user: dict = Depends(get_current_user)
):
    """Submit exam and get results"""
    attempt = db.exam_attempts.find_one({"_id": ObjectId(attempt_id)})
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if attempt["status"] != AttemptStatus.IN_PROGRESS.value:
        raise HTTPException(status_code=400, detail="Attempt already submitted")
    
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
        
        # Evaluate based on question type
        if question["type"] == QuestionType.MCQ_MULTI.value:
            correct_set = set(question["correct_answer"]) if isinstance(question["correct_answer"], list) else {question["correct_answer"]}
            answer_set = set(answer.answer) if isinstance(answer.answer, list) else {answer.answer}
            is_correct = correct_set == answer_set
        else:
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
            "time_spent_seconds": answer.time_spent_seconds,
            "flagged": answer.flagged
        })
    
    unanswered_count = len(exam["question_ids"]) - len(answered_ids)
    time_taken = int((datetime.now(timezone.utc) - attempt["started_at"]).total_seconds())
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
    
    # Award XP
    xp_earned = int(score * 10) + (50 if passed else 0)
    db.users.update_one({"_id": ObjectId(current_user["id"])}, {"$inc": {"xp_points": xp_earned}})
    
    log_audit(current_user.get("tenant_id"), current_user["id"], AuditAction.EXAM_SUBMIT.value, "exam_attempt", attempt_id)
    log_telemetry(current_user.get("tenant_id"), current_user["id"], "EXAM_SUBMITTED", {
        "exam_id": attempt["exam_id"],
        "score": score,
        "passed": passed
    })
    
    return {
        "id": attempt_id,
        "exam_id": attempt["exam_id"],
        "exam_title": exam["title"],
        "user_id": current_user["id"],
        "score": max(0, score),
        "total_marks": exam["total_marks"],
        "percentage": round(percentage, 2),
        "passed": passed,
        "correct_count": correct_count,
        "incorrect_count": incorrect_count,
        "unanswered_count": unanswered_count,
        "time_taken_seconds": time_taken,
        "xp_earned": xp_earned,
        "started_at": attempt["started_at"].isoformat(),
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "detailed_results": detailed_results if exam.get("show_result_immediately", True) else None
    }

@app.get("/api/attempts")
async def get_attempts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    exam_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's exam attempts"""
    query = {"user_id": current_user["id"]}
    if exam_id:
        query["exam_id"] = exam_id
    
    attempts = list(db.exam_attempts.find(query).skip(skip).limit(limit).sort("started_at", DESCENDING))
    total = db.exam_attempts.count_documents(query)
    
    for attempt in attempts:
        exam = db.exams.find_one({"_id": ObjectId(attempt["exam_id"])}, {"title": 1})
        attempt["exam_title"] = exam.get("title") if exam else "Unknown"
    
    return {"attempts": [serialize_doc(a) for a in attempts], "total": total}

@app.get("/api/attempts/{attempt_id}")
async def get_attempt(attempt_id: str, current_user: dict = Depends(get_current_user)):
    """Get attempt details"""
    attempt = db.exam_attempts.find_one({"_id": ObjectId(attempt_id)})
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    # Students can only see their own, managers/admins can see all
    if attempt["user_id"] != current_user["id"] and current_user["role"] not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    exam = db.exams.find_one({"_id": ObjectId(attempt["exam_id"])})
    attempt["exam_title"] = exam.get("title") if exam else "Unknown"
    
    return serialize_doc(attempt)

# ===========================================
# API ROUTES - NOTIFICATIONS
# ===========================================

@app.get("/api/notifications")
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Get user notifications"""
    query = {
        "$or": [
            {"user_id": current_user["id"]},
            {"user_id": None, "tenant_id": current_user.get("tenant_id")}
        ]
    }
    if unread_only:
        query["is_read"] = False
    
    notifications = list(db.notifications.find(query).skip(skip).limit(limit).sort("created_at", DESCENDING))
    total = db.notifications.count_documents(query)
    unread = db.notifications.count_documents({**query, "is_read": False})
    
    return {"notifications": [serialize_doc(n) for n in notifications], "total": total, "unread_count": unread}

@app.post("/api/notifications")
async def create_notification(
    notification_data: NotificationCreate,
    current_user: dict = Depends(require_roles([UserRole.MANAGER, UserRole.ADMIN]))
):
    """Create notification (Manager/Admin)"""
    notification = {
        **notification_data.model_dump(),
        "tenant_id": current_user.get("tenant_id"),
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    }
    result = db.notifications.insert_one(notification)
    notification["_id"] = result.inserted_id
    return serialize_doc(notification)

@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Mark notification as read"""
    db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Notification marked as read"}

@app.put("/api/notifications/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read"""
    db.notifications.update_many(
        {"$or": [{"user_id": current_user["id"]}, {"user_id": None}], "is_read": False},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc)}}
    )
    return {"message": "All notifications marked as read"}

# ===========================================
# API ROUTES - DASHBOARD & ANALYTICS
# ===========================================

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics based on user role"""
    tenant_id = current_user.get("tenant_id")
    
    base_stats = {
        "total_users": db.users.count_documents({"tenant_id": tenant_id, "is_active": True}),
        "total_courses": db.courses.count_documents({"tenant_id": tenant_id, "is_published": True}),
        "total_exams": db.exams.count_documents({"tenant_id": tenant_id, "status": {"$ne": ExamStatus.DRAFT.value}}),
        "total_questions": db.questions.count_documents({"tenant_id": tenant_id, "is_active": True}),
        "total_attempts": db.exam_attempts.count_documents({"tenant_id": tenant_id}),
    }
    
    if current_user["role"] == UserRole.STUDENT.value:
        # Student-specific stats
        my_attempts = list(db.exam_attempts.find({
            "user_id": current_user["id"],
            "status": AttemptStatus.EVALUATED.value
        }))
        
        base_stats.update({
            "my_exams_taken": len(my_attempts),
            "my_average_score": sum(a.get("percentage", 0) for a in my_attempts) / len(my_attempts) if my_attempts else 0,
            "my_pass_rate": sum(1 for a in my_attempts if a.get("passed", False)) / len(my_attempts) * 100 if my_attempts else 0,
            "my_xp_points": current_user.get("xp_points", 0),
            "my_level": current_user.get("level", 1),
            "my_streak": current_user.get("streak", 0),
            "my_courses_enrolled": 0,  # TODO: Implement enrollment tracking
        })
    else:
        # Admin/Manager stats
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = today - timedelta(days=7)
        
        all_attempts = list(db.exam_attempts.find({
            "tenant_id": tenant_id,
            "status": AttemptStatus.EVALUATED.value
        }))
        
        base_stats.update({
            "active_users_today": db.users.count_documents({"tenant_id": tenant_id, "last_login": {"$gte": today}}),
            "average_score": sum(a.get("percentage", 0) for a in all_attempts) / len(all_attempts) if all_attempts else 0,
            "pass_rate": sum(1 for a in all_attempts if a.get("passed", False)) / len(all_attempts) * 100 if all_attempts else 0,
            "recent_enrollments": db.users.count_documents({
                "tenant_id": tenant_id,
                "role": UserRole.STUDENT.value,
                "created_at": {"$gte": week_ago}
            }),
            "students_count": db.users.count_documents({"tenant_id": tenant_id, "role": UserRole.STUDENT.value}),
            "teachers_count": db.users.count_documents({"tenant_id": tenant_id, "role": UserRole.TEACHER.value}),
            "managers_count": db.users.count_documents({"tenant_id": tenant_id, "role": UserRole.MANAGER.value}),
            "ai_questions_count": db.questions.count_documents({"tenant_id": tenant_id, "is_ai_generated": True}),
        })
    
    return base_stats

@app.get("/api/dashboard/recent-activity")
async def get_recent_activity(
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """Get recent activity feed"""
    if current_user["role"] == UserRole.STUDENT.value:
        attempts = list(db.exam_attempts.find({"user_id": current_user["id"]}).sort("started_at", DESCENDING).limit(limit))
    else:
        attempts = list(db.exam_attempts.find({"tenant_id": current_user.get("tenant_id")}).sort("started_at", DESCENDING).limit(limit))
    
    activities = []
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
            "percentage": attempt.get("percentage"),
            "passed": attempt.get("passed"),
            "timestamp": attempt["started_at"].isoformat() if attempt.get("started_at") else None
        })
    
    return activities

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
    
    from collections import defaultdict
    daily_data = defaultdict(lambda: {"attempts": 0, "total_score": 0, "passed": 0})
    
    for attempt in attempts:
        date_key = attempt["started_at"].strftime("%Y-%m-%d")
        daily_data[date_key]["attempts"] += 1
        daily_data[date_key]["total_score"] += attempt.get("percentage", 0)
        if attempt.get("passed", False):
            daily_data[date_key]["passed"] += 1
    
    chart_data = []
    for date_str, data in sorted(daily_data.items()):
        chart_data.append({
            "date": date_str,
            "attempts": data["attempts"],
            "average_score": round(data["total_score"] / data["attempts"], 2) if data["attempts"] > 0 else 0,
            "pass_rate": round(data["passed"] / data["attempts"] * 100, 2) if data["attempts"] > 0 else 0
        })
    
    return chart_data

@app.get("/api/leaderboard")
async def get_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get top students by XP"""
    users = list(db.users.find(
        {"tenant_id": current_user.get("tenant_id"), "role": UserRole.STUDENT.value, "is_active": True},
        {"password": 0}
    ).sort("xp_points", DESCENDING).limit(limit))
    
    return [{"rank": i + 1, **serialize_doc(u)} for i, u in enumerate(users)]

# ===========================================
# API ROUTES - AUDIT LOGS
# ===========================================

@app.get("/api/audit-logs")
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    entity: Optional[str] = None,
    action: Optional[str] = None,
    user_id: Optional[str] = None,
    current_user: dict = Depends(require_roles([UserRole.MANAGER, UserRole.ADMIN]))
):
    """Get audit logs"""
    query = {"tenant_id": current_user.get("tenant_id")}
    if entity:
        query["entity"] = entity
    if action:
        query["action"] = action
    if user_id:
        query["user_id"] = user_id
    
    logs = list(db.audit_logs.find(query).skip(skip).limit(limit).sort("created_at", DESCENDING))
    total = db.audit_logs.count_documents(query)
    
    # Enrich with user names
    for log in logs:
        user = db.users.find_one({"_id": ObjectId(log["user_id"])}, {"name": 1})
        log["user_name"] = user.get("name") if user else "Unknown"
    
    return {"logs": [serialize_doc(l) for l in logs], "total": total}

# ===========================================
# API ROUTES - AI (COMMENTED OUT - SEE DOCS)
# ===========================================

@app.post("/api/ai/generate-questions")
async def generate_questions_ai(
    request: AIQuestionGenerate,
    current_user: dict = Depends(require_roles([UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    AI Question Generation - CURRENTLY DISABLED
    
    To enable AI features:
    1. Set AI_ENABLED=true in .env
    2. Configure EMERGENT_LLM_KEY with your API key
    3. See /app/docs/AI_INTEGRATION.md for full setup guide
    
    For now, use manual question creation at /api/questions POST
    """
    if not AI_ENABLED:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "AI features are currently disabled",
                "message": "To enable AI question generation, configure AI_ENABLED=true and EMERGENT_LLM_KEY in your environment. See /app/docs/AI_INTEGRATION.md for setup instructions.",
                "alternative": "Use POST /api/questions for manual question creation"
            }
        )
    
    # AI IMPLEMENTATION - COMMENTED OUT
    # Uncomment and configure when ready to enable AI
    """
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        category = db.categories.find_one({"_id": ObjectId(request.category_id)})
        category_name = category.get("name", "General") if category else "General"
        
        prompt = f'''Generate {request.count} {request.question_type.value} questions about "{request.topic}" for {category_name}.
Difficulty: {request.difficulty.value}
{f"Bloom's Level: {request.blooms_level}" if request.blooms_level else ""}
{f"Exam Type: {request.exam_type}" if request.exam_type else ""}

Return JSON array with structure:
{{
    "text": "Question text",
    "options": [{{"id": "a", "text": "Option A"}}, ...],
    "correct_answer": "a",
    "explanation": "Why this is correct",
    "tags": ["tag1", "tag2"]
}}

For TRUE_FALSE: options = [{{"id": "true", "text": "True"}}, {{"id": "false", "text": "False"}}]
For FILL_BLANK: options = null, correct_answer = "the word/phrase"
For MCQ_MULTI: correct_answer = ["a", "c"]

Return ONLY the JSON array.'''

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"question-gen-{current_user['id']}-{datetime.now().timestamp()}",
            system_message="You are an expert educational content creator."
        )
        chat.with_model("openai", "gpt-4o")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse and save questions
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        questions_data = json.loads(response_text.strip())
        
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
                "blooms_level": request.blooms_level,
                "tenant_id": current_user.get("tenant_id"),
                "created_by": current_user["id"],
                "is_active": True,
                "is_ai_generated": True,
                "ai_confidence": 0.85,  # Default confidence
                "created_at": datetime.now(timezone.utc)
            }
            result = db.questions.insert_one(question)
            question["_id"] = result.inserted_id
            saved_questions.append(serialize_doc(question))
        
        # Log AI usage
        db.ai_credit_usage.insert_one({
            "tenant_id": current_user.get("tenant_id"),
            "user_id": current_user["id"],
            "action": "question_generation",
            "tokens": len(prompt) + len(response),  # Approximate
            "cost": 0.01 * request.count,  # Approximate cost
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"message": f"Generated {len(saved_questions)} questions", "questions": saved_questions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
    """
    
    raise HTTPException(status_code=503, detail="AI features disabled. Enable in configuration.")

@app.post("/api/ai/suggest-course")
async def suggest_course_ai(
    request: AICourseGenerate,
    current_user: dict = Depends(require_roles([UserRole.TEACHER, UserRole.MANAGER, UserRole.ADMIN]))
):
    """
    AI Course Suggestion - CURRENTLY DISABLED
    
    See /app/docs/AI_INTEGRATION.md for setup
    """
    if not AI_ENABLED:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "AI features are currently disabled",
                "message": "Configure AI_ENABLED=true and EMERGENT_LLM_KEY to enable AI course suggestions."
            }
        )
    
    raise HTTPException(status_code=503, detail="AI features disabled. Enable in configuration.")

# ===========================================
# RUN
# ===========================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
