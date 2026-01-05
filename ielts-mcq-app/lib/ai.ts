/**
 * OpenAI Integration for AI-powered insights
 * 
 * This module handles all AI-related functionality:
 * - Generating insights for quiz results
 * - Analyzing weak areas
 * - Providing personalized recommendations
 * 
 * Uses Emergent LLM Key for OpenAI API access
 */

import OpenAI from 'openai';

// Initialize OpenAI client with Emergent LLM Key
// NOTE: The OPENAI_API_KEY should be set to the Emergent LLM Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Emergent LLM Key uses a custom base URL
  baseURL: 'https://api.emergentmethods.ai/v1',
});

/**
 * Interface for quiz attempt data used in AI analysis
 */
interface AttemptData {
  score: number;
  bandScore: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  topic: string;
  difficulty: string;
  wrongAnswers: {
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
    topic?: string;
  }[];
}

/**
 * Interface for AI-generated insights
 */
export interface AIInsights {
  summary: string;
  weakAreas: {
    area: string;
    description: string;
    improvementTip: string;
  }[];
  strengths: string[];
  recommendations: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  nextSteps: string[];
  motivationalMessage: string;
}

/**
 * Generate AI-powered insights for a quiz attempt
 * 
 * @param attemptData - Data from the completed quiz attempt
 * @returns AI-generated insights object
 */
export async function generateInsights(attemptData: AttemptData): Promise<AIInsights> {
  // Build the prompt for analysis
  const wrongAnswersList = attemptData.wrongAnswers
    .map((wa, i) => `${i + 1}. Q: "${wa.questionText}" - Selected: "${wa.selectedAnswer}" - Correct: "${wa.correctAnswer}"`)
    .join('\n');

  const prompt = `
You are an IELTS exam expert. Analyze the following quiz attempt and provide detailed insights.

**Quiz Details:**
- Topic: ${attemptData.topic}
- Difficulty: ${attemptData.difficulty}
- Score: ${attemptData.score.toFixed(1)}%
- Band Score: ${attemptData.bandScore}
- Questions: ${attemptData.correctAnswers}/${attemptData.totalQuestions} correct
- Time Taken: ${Math.floor(attemptData.timeTaken / 60)} minutes

**Questions Answered Incorrectly:**
${wrongAnswersList || 'None - Perfect score!'}

Provide your analysis in the following JSON format:
{
  "summary": "A 2-3 sentence summary of the student's performance",
  "weakAreas": [
    {
      "area": "Area name (e.g., 'Vocabulary', 'Grammar', 'Reading Comprehension')",
      "description": "Brief description of the weakness",
      "improvementTip": "Specific actionable tip to improve"
    }
  ],
  "strengths": ["List of identified strengths based on correct answers"],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed recommendation",
      "priority": "high/medium/low"
    }
  ],
  "nextSteps": ["List of 3-4 specific next steps for improvement"],
  "motivationalMessage": "An encouraging message for the student"
}

Ensure insights are specific, actionable, and encouraging.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Using GPT-4o for best analysis
      messages: [
        {
          role: 'system',
          content: 'You are an expert IELTS tutor who provides constructive, encouraging feedback. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    // Parse the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Extract JSON from the response (handle potential markdown code blocks)
    let jsonStr = content;
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0].trim();
    }
    
    const insights = JSON.parse(jsonStr) as AIInsights;
    return insights;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    
    // Return fallback insights if AI fails
    return generateFallbackInsights(attemptData);
  }
}

/**
 * Generate fallback insights when AI is unavailable
 * 
 * @param attemptData - Data from the completed quiz attempt
 * @returns Fallback insights object
 */
function generateFallbackInsights(attemptData: AttemptData): AIInsights {
  const percentage = attemptData.score;
  const band = attemptData.bandScore;
  
  let summary = '';
  let motivationalMessage = '';
  
  if (percentage >= 80) {
    summary = `Excellent performance! You scored ${percentage.toFixed(1)}% with a band score of ${band}. Your understanding of ${attemptData.topic} is strong.`;
    motivationalMessage = "Outstanding work! You're well on your way to achieving your IELTS goals. Keep up this excellent performance!";
  } else if (percentage >= 60) {
    summary = `Good effort! You scored ${percentage.toFixed(1)}% with a band score of ${band}. There's room for improvement in ${attemptData.topic}.`;
    motivationalMessage = "Good job! With focused practice on your weak areas, you can definitely improve your score. Keep pushing forward!";
  } else {
    summary = `You scored ${percentage.toFixed(1)}% with a band score of ${band}. More practice in ${attemptData.topic} is recommended.`;
    motivationalMessage = "Every expert was once a beginner. Don't be discouraged - consistent practice will lead to improvement. You've got this!";
  }
  
  return {
    summary,
    weakAreas: attemptData.wrongAnswers.length > 0 ? [
      {
        area: attemptData.topic,
        description: `You missed ${attemptData.wrongAnswers.length} questions in this topic.`,
        improvementTip: 'Review the explanations for incorrect answers and practice similar questions.',
      },
    ] : [],
    strengths: percentage >= 60 ? ['Good overall comprehension', 'Completed the quiz within time'] : ['Completed the entire quiz'],
    recommendations: [
      {
        title: 'Practice More Questions',
        description: `Focus on ${attemptData.topic} questions to strengthen your understanding.`,
        priority: percentage < 60 ? 'high' : 'medium',
      },
      {
        title: 'Review Incorrect Answers',
        description: 'Go through each incorrect answer and understand why the correct option is right.',
        priority: 'high',
      },
    ],
    nextSteps: [
      'Review all incorrect answers with explanations',
      'Practice 10 more questions in the same topic',
      'Take a timed practice test next week',
      'Focus on vocabulary building',
    ],
    motivationalMessage,
  };
}

/**
 * Generate a brief AI explanation for a specific question
 * 
 * @param question - The question text
 * @param correctAnswer - The correct answer
 * @param userAnswer - The user's selected answer
 * @returns AI-generated explanation
 */
export async function generateQuestionExplanation(
  question: string,
  correctAnswer: string,
  userAnswer: string | null
): Promise<string> {
  const prompt = `
Explain why "${correctAnswer}" is the correct answer for this IELTS question:
"${question}"

${userAnswer ? `The student selected "${userAnswer}" which was incorrect.` : 'The student did not answer.'}

Provide a brief, clear explanation (2-3 sentences) that helps the student understand the concept.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using smaller model for quick explanations
      messages: [
        {
          role: 'system',
          content: 'You are an IELTS tutor. Provide clear, concise explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content || 'Explanation not available.';
  } catch (error) {
    console.error('Error generating explanation:', error);
    return 'Explanation not available at this time.';
  }
}
