/**
 * AI Question Generator
 * 
 * Uses OpenAI GPT-4 to generate exam questions
 * Features:
 * - Subject and topic-based generation
 * - Multiple difficulty levels
 * - Various question types
 * - Approval workflow
 * - Cost tracking
 */

import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { QuestionType } from '@prisma/client'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'

// ===========================================
// TYPES
// ===========================================

interface GenerateQuestionsParams {
  tenantId: string
  userId: string
  categoryId?: string
  subject: string
  topic: string
  difficulty: number // 1-5
  count: number
  questionType: QuestionType
  examType?: string
  additionalInstructions?: string
}

interface GeneratedQuestion {
  text: string
  type: QuestionType
  difficulty: number
  marks: number
  options: Array<{ id: string; text: string; isCorrect: boolean }>
  correctAnswer: object
  explanation: string
  tags: string[]
  aiConfidence: number
}

interface GenerationResult {
  success: boolean
  questions: GeneratedQuestion[]
  tokensUsed: number
  estimatedCost: number
  logId: string
  error?: string
}

// ===========================================
// PROMPT TEMPLATES
// ===========================================

function buildSystemPrompt(): string {
  return `You are an expert exam question creator with deep knowledge across multiple subjects. 
Your task is to generate high-quality, pedagogically sound exam questions.

Guidelines:
1. Questions should be clear, unambiguous, and at the specified difficulty level
2. Avoid trick questions or deliberately confusing language
3. Provide comprehensive explanations that aid learning
4. Ensure options are plausible and well-distributed
5. Use proper grammar and formatting
6. Include relevant tags for categorization

Output Format:
Return a JSON object with an array of questions. Each question must have:
- text: Clear question statement
- type: Question type (MCQ_SINGLE, MCQ_MULTI, TRUE_FALSE, FILL_BLANK, CASE_BASED)
- difficulty: Difficulty rating (1-5)
- marks: Points for correct answer
- options: Array of answer options (for MCQ/TRUE_FALSE)
- correctAnswer: The correct answer(s)
- explanation: Detailed explanation of the answer
- tags: Relevant topic tags
- aiConfidence: Your confidence in question quality (0-1)

Difficulty Scale:
1 - Basic recall and understanding
2 - Simple application
3 - Moderate analysis
4 - Complex application and evaluation
5 - Advanced synthesis and expert-level

Be creative but accurate. Prioritize educational value.`
}

function buildUserPrompt(params: GenerateQuestionsParams): string {
  const {
    subject,
    topic,
    difficulty,
    count,
    questionType,
    examType,
    additionalInstructions,
  } = params

  let prompt = `Generate ${count} ${questionType} question(s) for the following:

Subject: ${subject}
Topic: ${topic}
Difficulty Level: ${difficulty}/5
${examType ? `Exam Type: ${examType}` : ''}

Requirements:
- Create ${count} unique, high-quality questions
- Difficulty should be ${difficulty}/5 (${getDifficultyLabel(difficulty)})
- Question type: ${questionType}
${questionType.includes('MCQ') ? '- Provide 4 options per question\n- Ensure only one option is clearly correct for MCQ_SINGLE\n- Ensure 2-3 options are correct for MCQ_MULTI' : ''}
${questionType === 'TRUE_FALSE' ? '- Provide True/False options with clear reasoning' : ''}
${questionType === 'FILL_BLANK' ? '- Design fill-in-the-blank with clear context' : ''}
- Include comprehensive explanations
- Add relevant tags

${additionalInstructions ? `Additional Instructions:\n${additionalInstructions}\n` : ''}`

  return prompt
}

function getDifficultyLabel(level: number): string {
  const labels = {
    1: 'Basic/Easy',
    2: 'Simple/Below Average',
    3: 'Moderate/Average',
    4: 'Challenging/Above Average',
    5: 'Advanced/Expert',
  }
  return labels[level as keyof typeof labels] || 'Moderate'
}

// ===========================================
// COST CALCULATION
// ===========================================

function estimateCost(tokensUsed: number, model: string): number {
  // Pricing as of 2024 (update as needed)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4-turbo-preview': { input: 0.01, output: 0.03 }, // per 1K tokens
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  }

  const rates = pricing[model] || pricing['gpt-4-turbo-preview']
  
  // Rough estimate: 60% input, 40% output
  const inputTokens = tokensUsed * 0.6
  const outputTokens = tokensUsed * 0.4
  
  const cost =
    (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output

  return cost
}

// ===========================================
// MAIN GENERATION FUNCTION
// ===========================================

export async function generateQuestions(
  params: GenerateQuestionsParams
): Promise<GenerationResult> {
  const startTime = Date.now()
  
  // Check if AI is enabled
  if (process.env.NEXT_PUBLIC_AI_ENABLED === 'false') {
    return {
      success: false,
      questions: [],
      tokensUsed: 0,
      estimatedCost: 0,
      logId: '',
      error: 'AI features are disabled',
    }
  }

  // Validate OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      questions: [],
      tokensUsed: 0,
      estimatedCost: 0,
      logId: '',
      error: 'OpenAI API key not configured',
    }
  }

  try {
    // Build prompts
    const systemPrompt = buildSystemPrompt()
    const userPrompt = buildUserPrompt(params)

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Empty response from OpenAI')
    }

    // Parse response
    const parsed = JSON.parse(content)
    const questions = parsed.questions || []

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid response format: no questions array')
    }

    // Validate and normalize questions
    const validatedQuestions = questions.map((q: any) =>
      validateAndNormalizeQuestion(q, params)
    )

    // Calculate costs
    const tokensUsed = response.usage?.total_tokens || 0
    const estimatedCost = estimateCost(tokensUsed, MODEL)

    // Create AI generation log
    const log = await prisma.aIGenerationLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        type: 'QUESTION',
        prompt: userPrompt,
        response: parsed,
        tokens: tokensUsed,
        cost: estimatedCost,
        status: 'SUCCESS',
      },
    })

    // Create questions in database (unapproved)
    const createdQuestions = await Promise.all(
      validatedQuestions.map((q) =>
        prisma.question.create({
          data: {
            tenantId: params.tenantId,
            categoryId: params.categoryId,
            createdById: params.userId,
            text: q.text,
            type: q.type,
            difficulty: q.difficulty,
            marks: q.marks,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            tags: q.tags,
            isApproved: false, // Requires manual approval
            isAIGenerated: true,
            aiConfidence: q.aiConfidence,
          },
        })
      )
    )

    console.log(`✅ Generated ${createdQuestions.length} questions in ${Date.now() - startTime}ms`)

    return {
      success: true,
      questions: validatedQuestions,
      tokensUsed,
      estimatedCost,
      logId: log.id,
    }
  } catch (error: any) {
    console.error('❌ AI Question Generation Error:', error)

    // Log failed attempt
    await prisma.aIGenerationLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        type: 'QUESTION',
        prompt: buildUserPrompt(params),
        response: { error: error.message },
        tokens: 0,
        cost: 0,
        status: 'FAILED',
      },
    })

    return {
      success: false,
      questions: [],
      tokensUsed: 0,
      estimatedCost: 0,
      logId: '',
      error: error.message || 'Unknown error',
    }
  }
}

// ===========================================
// VALIDATION & NORMALIZATION
// ===========================================

function validateAndNormalizeQuestion(
  question: any,
  params: GenerateQuestionsParams
): GeneratedQuestion {
  // Ensure all required fields exist with defaults
  return {
    text: question.text || 'Question text missing',
    type: question.type || params.questionType,
    difficulty: question.difficulty || params.difficulty,
    marks: question.marks || 1,
    options: normalizeOptions(question.options, question.type),
    correctAnswer: question.correctAnswer || {},
    explanation: question.explanation || 'No explanation provided',
    tags: Array.isArray(question.tags) ? question.tags : [params.topic],
    aiConfidence: question.aiConfidence || 0.7,
  }
}

function normalizeOptions(
  options: any,
  type: QuestionType
): Array<{ id: string; text: string; isCorrect: boolean }> {
  if (!Array.isArray(options)) {
    // Generate default options based on type
    if (type === 'TRUE_FALSE') {
      return [
        { id: 'true', text: 'True', isCorrect: false },
        { id: 'false', text: 'False', isCorrect: false },
      ]
    }
    return []
  }

  return options.map((opt, index) => ({
    id: opt.id || `opt-${index + 1}`,
    text: opt.text || `Option ${index + 1}`,
    isCorrect: Boolean(opt.isCorrect),
  }))
}

// ===========================================
// APPROVAL WORKFLOW
// ===========================================

export async function approveQuestion(
  questionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.question.update({
      where: { id: questionId },
      data: {
        isApproved: true,
        updatedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function rejectQuestion(
  questionId: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Soft delete by setting deletedAt
    await prisma.question.update({
      where: { id: questionId },
      data: {
        deletedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ===========================================
// USAGE ANALYTICS
// ===========================================

export async function getAIUsageStats(tenantId: string, userId?: string) {
  const where: any = { tenantId, status: 'SUCCESS' }
  if (userId) {
    where.userId = userId
  }

  const logs = await prisma.aIGenerationLog.findMany({
    where,
    select: {
      tokens: true,
      cost: true,
      type: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const totalTokens = logs.reduce((sum, log) => sum + (log.tokens || 0), 0)
  const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0)
  const requestCount = logs.length

  return {
    totalTokens,
    totalCost,
    requestCount,
    avgTokensPerRequest: requestCount > 0 ? totalTokens / requestCount : 0,
    avgCostPerRequest: requestCount > 0 ? totalCost / requestCount : 0,
    recentLogs: logs.slice(0, 10),
  }
}
