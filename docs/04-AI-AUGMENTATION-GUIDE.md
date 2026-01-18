# AI Augmentation Guide

## Overview

This platform leverages OpenAI's GPT-4 for intelligent question generation, enabling educators to rapidly create high-quality assessment content.

## Features

### 1. AI Question Generation
- Subject and topic-based generation
- Multiple difficulty levels (1-5)
- Various question types (MCQ, True/False, Fill in the Blank, Case-based)
- Bulk generation (1-50 questions at once)
- Quality scoring and confidence metrics

### 2. Approval Workflow
- All AI-generated questions require manual review
- Edit before approval
- Rejection with feedback
- Track AI-generated vs human-created content

### 3. Cost Tracking
- Token usage logging
- Per-request cost calculation
- Monthly usage reports
- Budget limits per tenant

## Setup

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create new secret key
5. Copy the key (starts with `sk-`)

### 2. Configure Environment

Add to `.env`:
```env
OPENAI_API_KEY="sk-your-key-here"
OPENAI_MODEL="gpt-4-turbo-preview"
NEXT_PUBLIC_AI_ENABLED="true"
```

### 3. Set Up Billing

1. Add payment method in OpenAI dashboard
2. Set usage limits (recommended)
3. Enable usage notifications
4. Monitor costs regularly

## Usage

### From Manager Dashboard

```typescript
// Example: Generate 10 algebra questions
const result = await generateQuestions({
  tenantId: 'tenant-id',
  userId: 'user-id',
  categoryId: 'algebra-cat-id',
  subject: 'Mathematics',
  topic: 'Linear Equations',
  difficulty: 3,
  count: 10,
  questionType: 'MCQ_SINGLE',
  examType: 'Practice Test',
  additionalInstructions: 'Focus on real-world applications'
})

// Result includes:
{
  success: true,
  questions: [...], // Generated questions
  tokensUsed: 2500,
  estimatedCost: 0.05,
  logId: 'log-uuid'
}
```

### API Endpoint

```typescript
// POST /api/questions/ai-generate
{
  "subject": "Physics",
  "topic": "Newton's Laws",
  "difficulty": 4,
  "count": 5,
  "questionType": "MCQ_SINGLE"
}
```

## Prompt Engineering

### System Prompt

The system prompt establishes the AI's role:
```
You are an expert exam question creator with deep knowledge 
across multiple subjects. Your task is to generate high-quality, 
pedagogically sound exam questions.
```

### User Prompt Structure

```
Generate {count} {type} question(s) for:
- Subject: {subject}
- Topic: {topic}
- Difficulty: {level}/5
- Requirements: {specific instructions}
```

### Prompt Best Practices

1. **Be Specific**: Clear subject and topic
2. **Set Context**: Exam type, audience level
3. **Define Quality**: What makes a good question
4. **Provide Examples**: Show desired format
5. **Iterate**: Refine based on results

### Custom Prompts

You can customize prompts in `lib/ai/question-generator.ts`:

```typescript
function buildUserPrompt(params: GenerateQuestionsParams): string {
  // Customize prompt structure here
  return `Custom prompt with ${params.topic}...`
}
```

## Question Quality

### AI Confidence Score

Each generated question includes a confidence score (0-1):
- **0.9-1.0**: Excellent quality
- **0.7-0.9**: Good quality, minor review needed
- **0.5-0.7**: Moderate quality, review carefully
- **<0.5**: Low quality, consider regenerating

### Quality Checkers

1. **Clarity**: Question is unambiguous
2. **Accuracy**: Correct answer is verifiable
3. **Difficulty**: Matches requested level
4. **Options**: Plausible distractors
5. **Explanation**: Clear and educational

### Improving Quality

```typescript
// Add specific instructions
additionalInstructions: `
- Use real-world scenarios
- Avoid trick questions
- Include step-by-step explanations
- Ensure distractors are plausible
- Use formal academic language
`
```

## Cost Management

### Pricing (as of 2024)

Model | Input (per 1K tokens) | Output (per 1K tokens)
------|----------------------|------------------------
GPT-4 Turbo | $0.01 | $0.03
GPT-4 | $0.03 | $0.06
GPT-3.5 Turbo | $0.0005 | $0.0015

### Cost Estimation

```typescript
// Approximate token usage per question:
- MCQ Single: ~150-250 tokens
- MCQ Multi: ~200-300 tokens
- True/False: ~100-150 tokens
- Fill Blank: ~150-200 tokens
- Case-based: ~300-500 tokens

// Example cost for 10 MCQ questions:
10 questions × 200 tokens = 2000 tokens
Cost ≈ $0.04-0.06
```

### Budget Controls

```typescript
// Set per-tenant limits in Subscription model
{
  aiCredits: 5000, // Number of AI operations
  maxAIRequestsPerDay: 100,
  costLimit: 50.00 // Monthly $ limit
}
```

### Monitoring Usage

```typescript
// Get usage statistics
const stats = await getAIUsageStats(tenantId)

{
  totalTokens: 125000,
  totalCost: 2.50,
  requestCount: 50,
  avgTokensPerRequest: 2500,
  avgCostPerRequest: 0.05
}
```

## Approval Workflow

### Review Process

1. Manager generates questions
2. Questions created with `isApproved: false`
3. Manager reviews each question:
   - Edit text if needed
   - Adjust difficulty
   - Modify options
   - Update explanation
4. Approve or reject:
   ```typescript
   await approveQuestion(questionId, userId)
   // or
   await rejectQuestion(questionId, userId, reason)
   ```

### Batch Operations

```typescript
// Approve multiple questions
await Promise.all(
  questionIds.map(id => approveQuestion(id, userId))
)
```

### Tracking AI Content

```typescript
// Find all AI-generated questions
const aiQuestions = await prisma.question.findMany({
  where: {
    tenantId,
    isAIGenerated: true,
    isApproved: false, // Pending review
  },
  orderBy: { createdAt: 'desc' }
})
```

## Advanced Features

### 1. Custom Question Templates

Define templates for consistent formatting:

```typescript
const templates = {
  physics_calculation: `
    Given: {values}
    Find: {target}
    Show: {show_work}
  `,
  vocabulary_synonym: `
    Which word is closest in meaning to "{word}"?
  `
}
```

### 2. Difficulty Calibration

```typescript
// Analyze past attempts to calibrate difficulty
const stats = await analyzeQuestionDifficulty(questionId)

// Auto-adjust AI difficulty prompts based on success rates
if (stats.correctRate > 0.9) {
  difficulty += 1 // Make harder
} else if (stats.correctRate < 0.3) {
  difficulty -= 1 // Make easier
}
```

### 3. Multi-language Support

```typescript
// Generate questions in different languages
{
  subject: 'Mathematics',
  topic: 'Algebra',
  language: 'es', // Spanish
  difficulty: 3,
  count: 5
}
```

### 4. Adaptive Generation

```typescript
// Generate based on student performance
const weakAreas = await identifyWeakAreas(studentId)

for (const area of weakAreas) {
  await generateQuestions({
    topic: area.topic,
    difficulty: area.difficulty,
    count: 5
  })
}
```

## Error Handling

### Common Errors

1. **API Key Invalid**
```typescript
Error: 'OpenAI API key not configured'
Solution: Check OPENAI_API_KEY in .env
```

2. **Rate Limit Exceeded**
```typescript
Error: 'Rate limit exceeded'
Solution: Implement retry logic or upgrade plan
```

3. **Invalid Response Format**
```typescript
Error: 'Invalid response format: no questions array'
Solution: Check prompt structure and response parsing
```

### Retry Logic

```typescript
async function generateWithRetry(params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateQuestions(params)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await delay(2000 * (i + 1)) // Exponential backoff
    }
  }
}
```

## Best Practices

### 1. Generation Strategy
- Start with small batches (5-10 questions)
- Review quality before scaling up
- Use specific topics for better results
- Provide context in additional instructions

### 2. Cost Optimization
- Cache common question types
- Batch similar requests
- Use GPT-3.5 for simple questions
- Monitor usage regularly

### 3. Quality Assurance
- Always review AI-generated content
- Test questions with real users
- Collect feedback on question quality
- Iterate on prompts

### 4. Security
- Never expose API keys client-side
- Implement rate limiting
- Validate all inputs
- Log all AI interactions

## Troubleshooting

### Issue: Poor Question Quality

**Solutions:**
1. Increase difficulty specificity
2. Add more context in instructions
3. Provide example questions
4. Review and refine prompts

### Issue: High Costs

**Solutions:**
1. Switch to GPT-3.5 for simple questions
2. Reduce `max_tokens` parameter
3. Implement caching
4. Set budget limits

### Issue: Slow Generation

**Solutions:**
1. Generate in smaller batches
2. Use async processing
3. Cache frequently used questions
4. Consider rate limits

## Future AI Features

- **Auto-grading**: AI-powered essay grading
- **Personalized Learning**: Adaptive question difficulty
- **Content Recommendations**: AI-suggested study materials
- **Performance Insights**: AI-powered analytics
- **Question Similarity Detection**: Prevent duplicates
- **Automatic Translation**: Multi-language support
- **Voice Questions**: Audio question generation
- **Image Generation**: Diagrams for questions

## Resources

- [OpenAI Documentation](https://platform.openai.com/docs)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [GPT Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)
- [Cost Calculator](https://openai.com/pricing)
