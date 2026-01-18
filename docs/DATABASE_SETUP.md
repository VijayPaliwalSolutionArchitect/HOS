# Database Setup and Configuration Guide

## 📚 Table of Contents
1. [MongoDB Setup](#mongodb-setup)
2. [Database Schema](#database-schema)
3. [Data Storage Examples](#data-storage-examples)
4. [Questions Management](#questions-management)
5. [Configuration](#configuration)
6. [Common Operations](#common-operations)
7. [Backup & Restore](#backup--restore)
8. [Troubleshooting](#troubleshooting)

---

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB Installation

#### On Ubuntu/Debian:
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
mongosh --version
```

#### On macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0

# Start MongoDB
brew services start mongodb-community@6.0

# Verify installation
mongosh --version
```

#### On Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer (.msi file)
3. Choose "Complete" installation
4. Install MongoDB Compass (GUI tool) when prompted
5. MongoDB will run as a Windows Service automatically

### Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Click "Build a Database" → Choose "FREE" tier (M0)
4. Select a cloud provider and region
5. Create cluster (takes 3-5 minutes)
6. Configure Database Access:
   - Click "Database Access" → "Add New Database User"
   - Create username and password
   - Set permissions to "Read and write to any database"
7. Configure Network Access:
   - Click "Network Access" → "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses
8. Get Connection String:
   - Click "Connect" → "Connect your application"
   - Copy the connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Option 3: Docker (Quickest for Development)

```bash
# Pull MongoDB image
docker pull mongo:6.0

# Run MongoDB container
docker run -d \
  --name eduexam-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  -v mongodb_data:/data/db \
  mongo:6.0

# Connection string: mongodb://admin:admin123@localhost:27017/
```

---

## 📊 Database Schema

### Collections Overview

The EduExam Pro system uses 12 MongoDB collections:

#### 1. **users** - User Accounts
```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  password: "$2b$12$...", // bcrypt hash
  role: "STUDENT", // STUDENT, TEACHER, MANAGER, ADMIN
  tenant_id: "tenant123",
  avatar: "https://...",
  xp_points: 1500,
  level: 5,
  streak: 7,
  is_active: true,
  created_at: ISODate("2024-01-01T00:00:00Z"),
  last_login: ISODate("2024-01-15T10:30:00Z")
}
```

#### 2. **tenants** - Organizations
```javascript
{
  _id: ObjectId("..."),
  name: "ABC Coaching Institute",
  domain: "abc-coaching",
  logo: "https://...",
  settings: {
    theme: "light",
    language: "en",
    timezone: "UTC"
  },
  is_active: true,
  created_at: ISODate("2024-01-01T00:00:00Z")
}
```

#### 3. **subscriptions** - Billing Plans
```javascript
{
  _id: ObjectId("..."),
  tenant_id: "tenant123",
  plan: "ENTERPRISE", // FREE, PRO, INSTITUTION, ENTERPRISE
  status: "ACTIVE", // ACTIVE, CANCELLED, EXPIRED, TRIAL
  features: {
    max_users: -1, // -1 = unlimited
    max_exams: -1,
    max_questions: -1,
    ai_credits: 1000,
    storage_gb: 100
  },
  current_period_start: ISODate("2024-01-01T00:00:00Z"),
  current_period_end: ISODate("2025-01-01T00:00:00Z"),
  created_at: ISODate("2024-01-01T00:00:00Z")
}
```

#### 4. **categories** - Hierarchical Categories
```javascript
{
  _id: ObjectId("..."),
  name: "IELTS Preparation",
  slug: "ielts-preparation",
  description: "Complete IELTS exam preparation",
  icon: "📝",
  parent_id: null, // null for root categories
  order: 0,
  tenant_id: "tenant123",
  is_active: true,
  created_at: ISODate("2024-01-01T00:00:00Z")
}

// Subcategory example:
{
  _id: ObjectId("..."),
  name: "Listening",
  slug: "ielts-listening",
  description: "IELTS Listening section",
  icon: "🎧",
  parent_id: "parent_category_id", // References parent category
  order: 1,
  tenant_id: "tenant123",
  is_active: true,
  created_at: ISODate("2024-01-01T00:00:00Z")
}
```

#### 5. **courses** - Course Content
```javascript
{
  _id: ObjectId("..."),
  title: "Complete IELTS Preparation Course",
  description: "Master all four IELTS sections...",
  category_id: "category123",
  thumbnail: "https://...",
  duration_hours: 60,
  difficulty: "MEDIUM", // EASY, MEDIUM, HARD, EXPERT
  is_featured: true,
  tags: ["ielts", "english", "exam-prep"],
  syllabus: [
    {
      week: 1,
      title: "Introduction to IELTS",
      topics: ["Format Overview", "Scoring System"]
    }
  ],
  enrollment_count: 1250,
  rating: 4.8,
  tenant_id: "tenant123",
  instructor_id: "teacher123",
  is_published: true,
  created_at: ISODate("2024-01-01T00:00:00Z")
}
```

#### 6. **questions** - Question Bank
```javascript
// MCQ Single Choice Example:
{
  _id: ObjectId("..."),
  category_id: "category123",
  type: "MCQ_SINGLE", // MCQ_SINGLE, MCQ_MULTI, TRUE_FALSE, FILL_BLANK, CASE_BASED
  text: "What is the capital of France?",
  options: [
    { id: "a", text: "London" },
    { id: "b", text: "Paris" },
    { id: "c", text: "Berlin" },
    { id: "d", text: "Madrid" }
  ],
  correct_answer: "b",
  explanation: "Paris is the capital and largest city of France.",
  difficulty: "EASY",
  marks: 1,
  negative_marks: 0.25,
  tags: ["geography", "europe"],
  case_context: null, // Used for CASE_BASED questions
  blooms_level: "Remember", // Remember, Understand, Apply, Analyze, Evaluate, Create
  tenant_id: "tenant123",
  created_by: "teacher123",
  is_active: true,
  is_ai_generated: false,
  created_at: ISODate("2024-01-01T00:00:00Z")
}

// MCQ Multiple Choice Example:
{
  _id: ObjectId("..."),
  type: "MCQ_MULTI",
  text: "Select all programming languages:",
  options: [
    { id: "a", text: "Python" },
    { id: "b", text: "HTML" },
    { id: "c", text: "JavaScript" },
    { id: "d", text: "CSS" }
  ],
  correct_answer: ["a", "c"], // Multiple correct answers
  marks: 2,
  negative_marks: 0.5
}

// True/False Example:
{
  _id: ObjectId("..."),
  type: "TRUE_FALSE",
  text: "The Earth is flat.",
  options: [
    { id: "true", text: "True" },
    { id: "false", text: "False" }
  ],
  correct_answer: "false",
  marks: 1
}

// Fill in the Blank Example:
{
  _id: ObjectId("..."),
  type: "FILL_BLANK",
  text: "The capital of India is _____.",
  options: null, // No options for fill-in-the-blank
  correct_answer: "New Delhi",
  marks: 1
}

// Case-Based Example:
{
  _id: ObjectId("..."),
  type: "CASE_BASED",
  text: "Based on the passage, what is the main argument?",
  case_context: "Climate change represents one of the most significant challenges...",
  options: [
    { id: "a", text: "Climate change is natural" },
    { id: "b", text: "Human activities cause warming" }
  ],
  correct_answer: "b",
  marks: 3
}
```

#### 7. **exams** - Exam Definitions
```javascript
{
  _id: ObjectId("..."),
  title: "IELTS Practice Test 1",
  description: "Comprehensive practice test covering all sections",
  category_id: "category123",
  duration_minutes: 60,
  total_marks: 40,
  passing_marks: 24,
  instructions: "<h3>Instructions:</h3><ul><li>Read carefully...</li></ul>",
  shuffle_questions: true,
  shuffle_options: true,
  show_result_immediately: true,
  allow_review: true,
  negative_marking: true,
  question_ids: ["q1", "q2", "q3", ...], // Array of question IDs
  rules: { // Auto-generation rules (optional)
    easy: 5,
    medium: 10,
    hard: 5
  },
  version: 1, // Increments when questions change after publishing
  status: "PUBLISHED", // DRAFT, PUBLISHED, ACTIVE, COMPLETED, ARCHIVED
  tenant_id: "tenant123",
  created_by: "teacher123",
  created_at: ISODate("2024-01-01T00:00:00Z"),
  published_at: ISODate("2024-01-05T00:00:00Z")
}
```

#### 8. **exam_attempts** - Student Submissions
```javascript
{
  _id: ObjectId("..."),
  exam_id: "exam123",
  exam_version: 1,
  user_id: "student123",
  tenant_id: "tenant123",
  status: "EVALUATED", // IN_PROGRESS, SUBMITTED, EVALUATED, EXPIRED
  answers: [
    {
      question_id: "q1",
      answer: "b",
      time_spent_seconds: 45,
      flagged: false
    }
  ],
  score: 32,
  correct_count: 18,
  incorrect_count: 7,
  unanswered_count: 5,
  percentage: 80.0,
  passed: true,
  time_taken_seconds: 3240,
  started_at: ISODate("2024-01-10T10:00:00Z"),
  submitted_at: ISODate("2024-01-10T11:00:00Z"),
  detailed_results: [ /* Full results with explanations */ ]
}
```

#### 9. **audit_logs** - Compliance & Tracking
```javascript
{
  _id: ObjectId("..."),
  tenant_id: "tenant123",
  user_id: "admin123",
  action: "CREATE", // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXAM_START, EXAM_SUBMIT, PUBLISH
  entity: "exam", // user, tenant, category, course, question, exam, exam_attempt
  entity_id: "exam123",
  meta: {
    title: "New IELTS Exam",
    changes: ["added 20 questions"]
  },
  created_at: ISODate("2024-01-10T15:30:00Z")
}
```

#### 10. **notifications** - User Notifications
```javascript
{
  _id: ObjectId("..."),
  tenant_id: "tenant123",
  user_id: "student123", // null for broadcast notifications
  type: "EXAM_ASSIGNED", // EXAM_ASSIGNED, EXAM_REMINDER, RESULT_PUBLISHED, etc.
  title: "New Exam Available",
  message: "IELTS Practice Test 1 is now available",
  link: "/student/exams/exam123",
  is_read: false,
  created_at: ISODate("2024-01-10T00:00:00Z"),
  expires_at: ISODate("2024-02-10T00:00:00Z")
}
```

#### 11. **telemetry_events** - Anti-Cheating
```javascript
{
  _id: ObjectId("..."),
  exam_attempt_id: "attempt123",
  user_id: "student123",
  tenant_id: "tenant123",
  event_type: "TAB_SWITCH", // TAB_SWITCH, WINDOW_BLUR, COPY_ATTEMPT, PASTE_ATTEMPT, etc.
  event_data: {
    previous_tab: "exam",
    new_tab: "google.com",
    duration_seconds: 15
  },
  risk_score: 10, // Higher = more suspicious
  created_at: ISODate("2024-01-10T10:15:30Z")
}
```

#### 12. **exam_risk_profiles** - Risk Assessment
```javascript
{
  _id: ObjectId("..."),
  exam_attempt_id: "attempt123",
  tenant_id: "tenant123",
  user_id: "student123",
  total_risk_score: 45,
  risk_level: "MEDIUM", // LOW, MEDIUM, HIGH, CRITICAL
  flagged_events: [
    {
      event_type: "TAB_SWITCH",
      timestamp: ISODate("2024-01-10T10:15:30Z"),
      risk_score: 10
    }
  ],
  event_count: 5,
  analysis_notes: "Automated analysis: 2 high-risk events detected",
  reviewed_by: null, // Manager ID after review
  review_status: "PENDING", // PENDING, REVIEWED, AUTO_CLEARED
  created_at: ISODate("2024-01-10T11:00:00Z"),
  updated_at: ISODate("2024-01-10T11:00:00Z")
}
```

---

## 💾 Data Storage Examples

### Example 1: Creating a New Question via API

```bash
curl -X POST http://localhost:8001/api/questions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "type": "MCQ_SINGLE",
    "text": "What is 2 + 2?",
    "options": [
      {"id": "a", "text": "3"},
      {"id": "b", "text": "4"},
      {"id": "c", "text": "5"},
      {"id": "d", "text": "6"}
    ],
    "correct_answer": "b",
    "explanation": "2 + 2 equals 4",
    "difficulty": "EASY",
    "marks": 1,
    "negative_marks": 0.25,
    "tags": ["math", "arithmetic"]
  }'
```

### Example 2: Creating Questions via Python Script

```python
import requests

# Login to get token
login_response = requests.post('http://localhost:8001/api/auth/login', json={
    'email': 'teacher@eduexam.com',
    'password': 'teacher123'
})
token = login_response.json()['access_token']

# Create question
headers = {'Authorization': f'Bearer {token}'}
question_data = {
    'category_id': '65a1b2c3d4e5f6g7h8i9j0k1',
    'type': 'MCQ_SINGLE',
    'text': 'Who wrote "Romeo and Juliet"?',
    'options': [
        {'id': 'a', 'text': 'Charles Dickens'},
        {'id': 'b', 'text': 'William Shakespeare'},
        {'id': 'c', 'text': 'Jane Austen'},
        {'id': 'd', 'text': 'Mark Twain'}
    ],
    'correct_answer': 'b',
    'explanation': 'Romeo and Juliet was written by William Shakespeare.',
    'difficulty': 'MEDIUM',
    'marks': 1,
    'tags': ['literature', 'shakespeare']
}

response = requests.post('http://localhost:8001/api/questions', 
                        json=question_data, 
                        headers=headers)
print(response.json())
```

### Example 3: Bulk Import Questions from CSV

Create a file `questions.csv`:
```csv
category_id,type,text,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,marks
65a1b2c3d4e5f6g7h8i9j0k1,MCQ_SINGLE,"What is the capital of France?",London,Paris,Berlin,Madrid,b,"Paris is the capital of France.",EASY,1
65a1b2c3d4e5f6g7h8i9j0k1,MCQ_SINGLE,"Who painted the Mona Lisa?","Vincent van Gogh","Leonardo da Vinci","Pablo Picasso","Michelangelo",b,"Leonardo da Vinci painted the Mona Lisa.",MEDIUM,1
```

Python script to import:
```python
import csv
import requests

# Login
login_response = requests.post('http://localhost:8001/api/auth/login', json={
    'email': 'teacher@eduexam.com',
    'password': 'teacher123'
})
token = login_response.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Read CSV and create questions
with open('questions.csv', 'r') as file:
    reader = csv.DictReader(file)
    questions = []
    
    for row in reader:
        question = {
            'category_id': row['category_id'],
            'type': row['type'],
            'text': row['text'],
            'options': [
                {'id': 'a', 'text': row['option_a']},
                {'id': 'b', 'text': row['option_b']},
                {'id': 'c', 'text': row['option_c']},
                {'id': 'd', 'text': row['option_d']}
            ],
            'correct_answer': row['correct_answer'],
            'explanation': row['explanation'],
            'difficulty': row['difficulty'],
            'marks': int(row['marks']),
            'tags': []
        }
        questions.append(question)

# Bulk create
response = requests.post('http://localhost:8001/api/questions/bulk',
                        json=questions,
                        headers=headers)
print(f"Created {response.json()['count']} questions")
```

### Example 4: Direct MongoDB Insert (Advanced)

```python
from pymongo import MongoClient
from datetime import datetime, timezone
from bson import ObjectId

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017')
db = client['edtech_saas']

# Insert a question directly
question = {
    'category_id': '65a1b2c3d4e5f6g7h8i9j0k1',
    'type': 'MCQ_SINGLE',
    'text': 'What is the largest planet in our solar system?',
    'options': [
        {'id': 'a', 'text': 'Earth'},
        {'id': 'b', 'text': 'Jupiter'},
        {'id': 'c', 'text': 'Saturn'},
        {'id': 'd', 'text': 'Mars'}
    ],
    'correct_answer': 'b',
    'explanation': 'Jupiter is the largest planet in our solar system.',
    'difficulty': 'EASY',
    'marks': 1,
    'negative_marks': 0,
    'tags': ['science', 'astronomy'],
    'tenant_id': 'your_tenant_id',
    'created_by': 'your_teacher_id',
    'is_active': True,
    'is_ai_generated': False,
    'created_at': datetime.now(timezone.utc)
}

result = db.questions.insert_one(question)
print(f"Inserted question with ID: {result.inserted_id}")
```

---

## 📝 Questions Management

### Creating Different Question Types

#### 1. Multiple Choice (Single Answer)
```json
{
  "type": "MCQ_SINGLE",
  "text": "Which programming language is known for data science?",
  "options": [
    {"id": "a", "text": "Python"},
    {"id": "b", "text": "C++"},
    {"id": "c", "text": "Assembly"},
    {"id": "d", "text": "COBOL"}
  ],
  "correct_answer": "a"
}
```

#### 2. Multiple Choice (Multiple Answers)
```json
{
  "type": "MCQ_MULTI",
  "text": "Select all web browsers:",
  "options": [
    {"id": "a", "text": "Chrome"},
    {"id": "b", "text": "Photoshop"},
    {"id": "c", "text": "Firefox"},
    {"id": "d", "text": "Excel"}
  ],
  "correct_answer": ["a", "c"]
}
```

#### 3. True/False
```json
{
  "type": "TRUE_FALSE",
  "text": "Python is a compiled language.",
  "options": [
    {"id": "true", "text": "True"},
    {"id": "false", "text": "False"}
  ],
  "correct_answer": "false"
}
```

#### 4. Fill in the Blank
```json
{
  "type": "FILL_BLANK",
  "text": "The speed of light is approximately _____ meters per second.",
  "options": null,
  "correct_answer": "300000000"
}
```

#### 5. Case-Based (Passage + Question)
```json
{
  "type": "CASE_BASED",
  "text": "According to the passage, what is the primary benefit of renewable energy?",
  "case_context": "Renewable energy sources such as solar and wind power offer numerous advantages. They reduce greenhouse gas emissions, decrease dependence on fossil fuels, and provide sustainable long-term energy solutions...",
  "options": [
    {"id": "a", "text": "Lower cost"},
    {"id": "b", "text": "Environmental sustainability"},
    {"id": "c", "text": "Faster implementation"},
    {"id": "d", "text": "Higher efficiency"}
  ],
  "correct_answer": "b"
}
```

### Creating Exams with Questions

```python
import requests

# 1. Get category ID
categories = requests.get('http://localhost:8001/api/categories',
                         headers=headers).json()
category_id = categories[0]['id']

# 2. Create questions (returns question IDs)
question_ids = []
for q in question_data_list:
    response = requests.post('http://localhost:8001/api/questions',
                            json=q, headers=headers)
    question_ids.append(response.json()['id'])

# 3. Create exam with these questions
exam_data = {
    'title': 'Final Exam - Mathematics',
    'description': 'Comprehensive final examination',
    'category_id': category_id,
    'duration_minutes': 90,
    'total_marks': 50,
    'passing_marks': 25,
    'instructions': '<h3>Important Instructions:</h3><ul><li>Calculator allowed</li><li>Show all work</li></ul>',
    'shuffle_questions': True,
    'shuffle_options': True,
    'show_result_immediately': True,
    'negative_marking': True,
    'question_ids': question_ids
}

exam_response = requests.post('http://localhost:8001/api/exams',
                             json=exam_data, headers=headers)
exam_id = exam_response.json()['id']

# 4. Publish exam (Manager/Admin only)
publish_response = requests.post(f'http://localhost:8001/api/exams/{exam_id}/publish',
                                headers=headers)
print("Exam published successfully!")
```

---

## ⚙️ Configuration

### Environment Variables (.env file)

Create a `.env` file in the `backend/` directory:

```bash
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
# For MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

DB_NAME=edtech_saas

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-use-64-chars-minimum
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# AI Configuration (Optional)
AI_ENABLED=false
EMERGENT_LLM_KEY=your-openai-api-key-here

# Server Configuration
HOST=0.0.0.0
PORT=8001
```

### Application Configuration

Edit `backend/server.py` configuration section if needed:

```python
# Line 44-53
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "edtech_saas")
JWT_SECRET = os.environ.get("JWT_SECRET", "your-super-secret-jwt-key")
```

---

## 🔧 Common Operations

### 1. View All Collections
```bash
# Using MongoDB Shell
mongosh edtech_saas

# List collections
show collections

# Output:
# audit_logs
# categories
# courses
# exam_attempts
# exam_risk_profiles
# exams
# notifications
# questions
# subscriptions
# telemetry_events
# tenants
# users
```

### 2. Query Questions
```javascript
// Get all active questions
db.questions.find({ is_active: true }).pretty()

// Get questions by category
db.questions.find({ category_id: "category123" })

// Get questions by difficulty
db.questions.find({ difficulty: "HARD" })

// Get questions with specific tags
db.questions.find({ tags: { $in: ["math", "algebra"] } })

// Count questions
db.questions.countDocuments({ is_active: true })
```

### 3. Query Exams
```javascript
// Get published exams
db.exams.find({ status: "PUBLISHED" })

// Get exams by category
db.exams.find({ category_id: "category123" })

// Get exam with full details
db.exams.findOne({ _id: ObjectId("exam_id") })
```

### 4. Query Exam Attempts
```javascript
// Get student's attempts
db.exam_attempts.find({ user_id: "student123" })

// Get attempts for specific exam
db.exam_attempts.find({ exam_id: "exam123" })

// Get completed attempts with high scores
db.exam_attempts.find({
  status: "EVALUATED",
  percentage: { $gte: 80 }
})
```

### 5. Update Operations
```javascript
// Deactivate a question
db.questions.updateOne(
  { _id: ObjectId("question_id") },
  { $set: { is_active: false } }
)

// Update exam status
db.exams.updateOne(
  { _id: ObjectId("exam_id") },
  { $set: { status: "ARCHIVED" } }
)

// Bulk update - add tag to all questions in category
db.questions.updateMany(
  { category_id: "category123" },
  { $addToSet: { tags: "reviewed" } }
)
```

### 6. Delete Operations (Use Carefully!)
```javascript
// Soft delete (recommended) - mark as inactive
db.questions.updateOne(
  { _id: ObjectId("question_id") },
  { $set: { is_active: false, deleted_at: new Date() } }
)

// Hard delete (not recommended)
db.questions.deleteOne({ _id: ObjectId("question_id") })

// Delete all draft exams
db.exams.deleteMany({ status: "DRAFT" })
```

---

## 💾 Backup & Restore

### Backup MongoDB Database

```bash
# Backup entire database
mongodump --db edtech_saas --out /backup/$(date +%Y%m%d)

# Backup specific collection
mongodump --db edtech_saas --collection questions --out /backup/questions_$(date +%Y%m%d)

# Backup with authentication (MongoDB Atlas)
mongodump --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/edtech_saas" --out /backup/$(date +%Y%m%d)
```

### Restore MongoDB Database

```bash
# Restore entire database
mongorestore --db edtech_saas /backup/20240115/edtech_saas

# Restore specific collection
mongorestore --db edtech_saas --collection questions /backup/questions_20240115/edtech_saas/questions.bson

# Restore with drop (replace existing data)
mongorestore --db edtech_saas --drop /backup/20240115/edtech_saas
```

### Export to JSON (Human-Readable)

```bash
# Export collection to JSON
mongoexport --db edtech_saas --collection questions --out questions.json --jsonArray --pretty

# Export with query filter
mongoexport --db edtech_saas --collection questions --query '{"difficulty":"HARD"}' --out hard_questions.json
```

### Import from JSON

```bash
# Import JSON file
mongoimport --db edtech_saas --collection questions --file questions.json --jsonArray

# Import with upsert (update existing, insert new)
mongoimport --db edtech_saas --collection questions --file questions.json --mode upsert
```

---

## 🐛 Troubleshooting

### Problem 1: Cannot Connect to MongoDB

**Error:** `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# If not running, start it
sudo systemctl start mongod

# Enable auto-start on boot
sudo systemctl enable mongod
```

### Problem 2: Authentication Failed

**Error:** `MongoServerError: Authentication failed`

**Solution:**
1. Check your connection string credentials
2. Verify user has correct permissions in MongoDB
3. For Atlas: Ensure IP is whitelisted in Network Access

```bash
# Create user with proper permissions
mongosh
use edtech_saas
db.createUser({
  user: "eduexam_user",
  pwd: "secure_password",
  roles: [{ role: "readWrite", db: "edtech_saas" }]
})
```

### Problem 3: Duplicate Key Error

**Error:** `E11000 duplicate key error collection: edtech_saas.users index: email_1`

**Solution:**
This means you're trying to insert a document with a duplicate unique field (e.g., email).

```javascript
// Check existing user
db.users.findOne({ email: "duplicate@example.com" })

// If you need to allow duplicate, drop the unique index
db.users.dropIndex("email_1")

// Recreate without unique constraint (not recommended for emails)
db.users.createIndex({ email: 1 })
```

### Problem 4: Indexes Not Working

**Check existing indexes:**
```javascript
db.questions.getIndexes()
```

**Recreate indexes:**
```javascript
// Drop all indexes (except _id)
db.questions.dropIndexes()

// Create recommended indexes
db.questions.createIndex({ category_id: 1, difficulty: 1 })
db.questions.createIndex({ tags: 1 })
db.questions.createIndex({ is_active: 1 })
```

### Problem 5: Large Database Size

**Check database size:**
```javascript
db.stats(1024*1024) // Size in MB
```

**Solutions:**
1. Remove old audit logs:
```javascript
// Delete audit logs older than 90 days
db.audit_logs.deleteMany({
  created_at: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
})
```

2. Compact collections:
```bash
mongosh edtech_saas --eval "db.questions.compact()"
```

3. Archive old data to separate database

---

## 📊 Database Monitoring

### Check Collection Sizes

```javascript
// Get size of all collections
db.getCollectionNames().forEach(function(collection) {
  var stats = db[collection].stats();
  print(collection + ": " + (stats.size / 1024 / 1024).toFixed(2) + " MB");
});
```

### Monitor Active Connections

```javascript
db.serverStatus().connections
```

### Check Current Operations

```javascript
db.currentOp()
```

### Performance Statistics

```javascript
// Get database stats
db.stats()

// Get collection stats
db.questions.stats()
```

---

## 🎯 Best Practices

1. **Always Use Indexes**: Critical fields like `category_id`, `user_id`, `email` should be indexed
2. **Soft Deletes**: Use `is_active: false` instead of hard deletes
3. **Regular Backups**: Daily backups for production, weekly for development
4. **Audit Everything**: Log all critical operations for compliance
5. **Data Validation**: Use Pydantic models to validate before insertion
6. **Connection Pooling**: Default in PyMongo, but configure for high traffic
7. **Use Transactions**: For operations that require atomicity (e.g., exam submission + result calculation)

---

## 📞 Support

For issues:
1. Check logs: `tail -f /var/log/mongodb/mongod.log`
2. Enable debug logging in FastAPI: Set `DEBUG=True` in environment
3. Use MongoDB Compass GUI for visual debugging
4. Refer to official MongoDB documentation: https://docs.mongodb.com/

---

**Last Updated:** January 2024  
**Version:** 1.0
