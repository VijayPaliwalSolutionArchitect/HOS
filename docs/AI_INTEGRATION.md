# AI Integration Guide - EduExam Pro

## Overview

EduExam Pro supports AI-powered features for question generation, course creation, and intelligent assessments. **By default, AI features are DISABLED** to allow manual operation and cost control.

This guide covers:
1. How to enable AI features
2. Configuration options
3. Available AI endpoints
4. Cost management
5. Manual alternatives

---

## 1. Enabling AI Features

### Prerequisites
- OpenAI API key OR Emergent LLM Key
- Sufficient API credits

### Configuration Steps

1. **Edit Backend Environment File**
   ```bash
   nano /app/backend/.env
   ```

2. **Add/Update these variables:**
   ```env
   # Enable AI features
   AI_ENABLED=true
   
   # API Key (Choose one):
   # Option A: Emergent LLM Key (Universal key for OpenAI/Anthropic/Gemini)
   EMERGENT_LLM_KEY=sk-emergent-your-key-here
   
   # Option B: Direct OpenAI Key
   # OPENAI_API_KEY=sk-your-openai-key-here
   ```

3. **Restart Backend**
   ```bash
   sudo supervisorctl restart backend
   ```

4. **Verify Status**
   ```bash
   curl http://localhost:8001/api/health
   # Should show: "ai_enabled": true
   ```

---

## 2. AI Features Available

### 2.1 Question Generation

**Endpoint:** `POST /api/ai/generate-questions`

**Request Body:**
```json
{
  "category_id": "string (ObjectId)",
  "topic": "Grammar - Tenses",
  "difficulty": "EASY | MEDIUM | HARD | EXPERT",
  "question_type": "MCQ_SINGLE | MCQ_MULTI | TRUE_FALSE | FILL_BLANK | CASE_BASED",
  "count": 5,
  "blooms_level": "Remember | Understand | Apply | Analyze | Evaluate | Create",
  "exam_type": "IELTS | Competitive | Academic | Corporate"
}
```

**Response:**
```json
{
  "message": "Generated 5 questions",
  "questions": [
    {
      "id": "...",
      "text": "Question text...",
      "options": [...],
      "correct_answer": "a",
      "explanation": "...",
      "is_ai_generated": true,
      "ai_confidence": 0.85
    }
  ]
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:8001/api/ai/generate-questions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "67890abc...",
    "topic": "English Grammar - Present Tense",
    "difficulty": "MEDIUM",
    "question_type": "MCQ_SINGLE",
    "count": 5,
    "blooms_level": "Apply"
  }'
```

### 2.2 Course Suggestion (Future)

**Endpoint:** `POST /api/ai/suggest-course`

**Request Body:**
```json
{
  "title": "IELTS Preparation",
  "audience": "Working professionals",
  "duration_weeks": 8,
  "difficulty": "MEDIUM",
  "learning_style": "Visual"
}
```

---

## 3. AI Prompt Templates

### Question Generation Prompt

The system uses this template for generating questions:

```text
Generate {count} {question_type} questions about "{topic}" for {category_name}.
Difficulty: {difficulty}
Bloom's Level: {blooms_level}
Exam Type: {exam_type}

Return JSON array with structure:
{
    "text": "Question text",
    "options": [{"id": "a", "text": "Option A"}, ...],
    "correct_answer": "a",
    "explanation": "Why this is correct",
    "tags": ["tag1", "tag2"]
}

For TRUE_FALSE: options = [{"id": "true", "text": "True"}, {"id": "false", "text": "False"}]
For FILL_BLANK: options = null, correct_answer = "the word/phrase"
For MCQ_MULTI: correct_answer = ["a", "c"]

Return ONLY the JSON array.
```

### Customizing Prompts

To customize prompts, modify the prompt string in:
```
/app/backend/server.py
```

Look for the `generate_questions_ai` function and edit the `prompt` variable.

---

## 4. Cost Management

### AI Usage Tracking

All AI operations are logged in the `ai_credit_usage` collection:

```json
{
  "tenant_id": "...",
  "user_id": "...",
  "action": "question_generation",
  "tokens": 1500,
  "cost": 0.05,
  "created_at": "2024-01-17T..."
}
```

### Cost Estimation

| Feature | Approx. Cost per Use |
|---------|---------------------|
| 5 Questions | $0.02 - $0.05 |
| 10 Questions | $0.04 - $0.10 |
| Course Outline | $0.05 - $0.15 |
| Practice Quiz | $0.03 - $0.08 |

### Budget Controls

Set limits in subscription settings:
```json
{
  "features": {
    "ai_credits": 1000,
    "max_ai_questions_per_day": 100
  }
}
```

---

## 5. Manual Alternatives (When AI is Disabled)

### Creating Questions Manually

**Endpoint:** `POST /api/questions`

```json
{
  "category_id": "...",
  "type": "MCQ_SINGLE",
  "text": "Your question here?",
  "options": [
    {"id": "a", "text": "Option A"},
    {"id": "b", "text": "Option B"},
    {"id": "c", "text": "Option C"},
    {"id": "d", "text": "Option D"}
  ],
  "correct_answer": "a",
  "explanation": "Explanation here",
  "difficulty": "MEDIUM",
  "marks": 1,
  "negative_marks": 0.25,
  "tags": ["grammar", "tenses"]
}
```

### Bulk Question Upload

**Endpoint:** `POST /api/questions/bulk`

```json
[
  { /* question 1 */ },
  { /* question 2 */ },
  { /* question 3 */ }
]
```

### Excel/CSV Import (TODO)

A future update will support:
- Excel file upload
- CSV import
- Question bank templates

---

## 6. Safeguards & Quality Control

### AI Output Validation

All AI-generated questions go through:

1. **JSON Validation** - Ensure valid structure
2. **Content Check** - Verify all required fields
3. **Duplicate Detection** - Compare with existing questions (vector similarity)
4. **Confidence Scoring** - AI provides confidence score (0-1)

### Human Approval Workflow

Recommended workflow:
1. AI generates questions → Saved with `status: "pending_review"`
2. Teacher/Manager reviews in Question Bank
3. Approve, Edit, or Reject
4. Only approved questions available for exams

### Quality Thresholds

```python
# In server.py, you can set:
AI_CONFIDENCE_THRESHOLD = 0.7  # Reject below this
DUPLICATE_SIMILARITY_THRESHOLD = 0.85  # Flag if too similar
```

---

## 7. Troubleshooting

### AI Features Not Working

1. **Check AI_ENABLED**
   ```bash
   grep AI_ENABLED /app/backend/.env
   # Should show: AI_ENABLED=true
   ```

2. **Check API Key**
   ```bash
   grep EMERGENT_LLM_KEY /app/backend/.env
   # Should show your key (not empty)
   ```

3. **Check Logs**
   ```bash
   tail -50 /var/log/supervisor/backend.err.log | grep -i ai
   ```

### Rate Limiting

If you hit rate limits:
- Wait 60 seconds before retrying
- Reduce `count` parameter
- Check your API plan limits

### Invalid JSON Response

If AI returns invalid JSON:
- Try a simpler topic
- Reduce question count
- Check API status at OpenAI

---

## 8. Security Considerations

### API Key Protection

- Never commit API keys to git
- Use environment variables only
- Rotate keys periodically

### User Access Control

Only these roles can use AI features:
- TEACHER
- MANAGER
- ADMIN

Students cannot directly access AI generation.

### Rate Limiting

Built-in protection:
- Max 100 AI requests per user per day
- Max 50 questions per single request
- Cooldown of 5 seconds between requests

---

## 9. Supported AI Models

### Via Emergent LLM Key

- OpenAI GPT-4o (default)
- OpenAI GPT-4o-mini
- Claude Sonnet 4.5
- Gemini 3 Flash

### Model Selection

In the code:
```python
chat.with_model("openai", "gpt-4o")  # Default
# chat.with_model("anthropic", "claude-sonnet-4-5")  # Alternative
```

---

## 10. Future AI Enhancements

### Planned Features

- [ ] Adaptive question difficulty
- [ ] Automatic plagiarism detection
- [ ] AI-powered exam proctoring
- [ ] Personalized learning paths
- [ ] Chat tutor integration
- [ ] Auto-grading for subjective answers

### Integration Roadmap

1. **Phase 1** (Current): Question generation, course suggestions
2. **Phase 2**: Adaptive exams, weak topic detection
3. **Phase 3**: Full AI proctoring, behavior analysis

---

## Quick Reference

### Enable AI
```bash
# Edit .env
AI_ENABLED=true
EMERGENT_LLM_KEY=sk-your-key

# Restart
sudo supervisorctl restart backend
```

### Test AI
```bash
curl -X POST http://localhost:8001/api/ai/generate-questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category_id":"...","topic":"Test","difficulty":"EASY","question_type":"MCQ_SINGLE","count":1}'
```

### Disable AI
```bash
# Edit .env
AI_ENABLED=false

# Restart
sudo supervisorctl restart backend
```

---

## Support

For issues with AI integration:
1. Check this documentation first
2. Review server logs
3. Verify API key is valid and has credits
4. Contact support with error details
