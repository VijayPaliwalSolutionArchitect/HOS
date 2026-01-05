/**
 * PDF Generation using @react-pdf/renderer
 * 
 * This module handles PDF generation for quiz results.
 * Uses react-pdf for lightweight, client-side PDF generation.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { calculateBandScore } from './utils';

// Register fonts (optional - using default for simplicity)
// Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' });

/**
 * PDF Styles
 * A4 page with professional layout
 */
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #6366f1',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 8,
  },
  scoreCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  bandScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 6,
    borderBottom: '1px solid #f1f5f9',
  },
  label: {
    fontSize: 12,
    color: '#64748b',
  },
  value: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  questionItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  questionNumber: {
    fontSize: 10,
    color: '#6366f1',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 11,
    color: '#1e293b',
    marginBottom: 8,
  },
  answerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  answerLabel: {
    fontSize: 10,
    color: '#64748b',
    width: 100,
  },
  answerValue: {
    fontSize: 10,
    color: '#1e293b',
    flex: 1,
  },
  correct: {
    color: '#10b981',
  },
  incorrect: {
    color: '#ef4444',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  insightBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    padding: 15,
    marginBottom: 15,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 11,
    color: '#1e293b',
    lineHeight: 1.5,
  },
});

/**
 * Interface for result data
 */
export interface ResultPDFData {
  userName: string;
  quizTitle: string;
  topic: string;
  difficulty: string;
  completedAt: string;
  score: number;
  bandScore: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // seconds
  questions: {
    number: number;
    text: string;
    userAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  aiInsights?: {
    summary: string;
    weakAreas: { area: string; improvementTip: string }[];
    recommendations: { title: string; description: string }[];
  };
}

/**
 * Format time from seconds to mm:ss string
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

/**
 * Result PDF Document Component
 * 
 * Generates a professional PDF report for quiz results.
 * Includes score overview, detailed breakdown, and AI insights.
 */
export const ResultPDFDocument = ({ data }: { data: ResultPDFData }) => (
  <Document>
    {/* Page 1: Overview */}
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>IELTS Practice Result</Text>
        <Text style={styles.subtitle}>
          {data.quizTitle} • {data.completedAt}
        </Text>
      </View>

      {/* Student Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{data.userName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Quiz Topic</Text>
          <Text style={styles.value}>{data.topic}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Difficulty</Text>
          <Text style={styles.value}>{data.difficulty}</Text>
        </View>
      </View>

      {/* Score Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Summary</Text>
        <View style={styles.scoreCard}>
          <View style={styles.scoreItem}>
            <Text style={styles.bandScore}>{data.bandScore}</Text>
            <Text style={styles.scoreLabel}>Band Score</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreValue}>{data.score.toFixed(1)}%</Text>
            <Text style={styles.scoreLabel}>Percentage</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreValue}>
              {data.correctAnswers}/{data.totalQuestions}
            </Text>
            <Text style={styles.scoreLabel}>Correct</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreValue}>{formatTime(data.timeTaken)}</Text>
            <Text style={styles.scoreLabel}>Time Taken</Text>
          </View>
        </View>
      </View>

      {/* AI Insights */}
      {data.aiInsights && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI-Powered Analysis</Text>
          <View style={styles.insightBox}>
            <Text style={styles.insightTitle}>Summary</Text>
            <Text style={styles.insightText}>{data.aiInsights.summary}</Text>
          </View>
          
          {data.aiInsights.weakAreas.length > 0 && (
            <View style={styles.insightBox}>
              <Text style={styles.insightTitle}>Areas for Improvement</Text>
              {data.aiInsights.weakAreas.map((area, idx) => (
                <Text key={idx} style={styles.insightText}>
                  • {area.area}: {area.improvementTip}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>IELTS MCQ Practice</Text>
        <Text style={styles.footerText}>Page 1</Text>
      </View>
    </Page>

    {/* Page 2: Detailed Question Breakdown */}
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Question Breakdown</Text>
        
        {data.questions.slice(0, 8).map((q) => (
          <View key={q.number} style={styles.questionItem}>
            <Text style={styles.questionNumber}>Question {q.number}</Text>
            <Text style={styles.questionText}>{q.text}</Text>
            
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>Your Answer:</Text>
              <Text
                style={[
                  styles.answerValue,
                  q.isCorrect ? styles.correct : styles.incorrect,
                ]}
              >
                {q.userAnswer || '(Not answered)'} {q.isCorrect ? '✓' : '✗'}
              </Text>
            </View>
            
            {!q.isCorrect && (
              <View style={styles.answerRow}>
                <Text style={styles.answerLabel}>Correct Answer:</Text>
                <Text style={[styles.answerValue, styles.correct]}>
                  {q.correctAnswer}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>IELTS MCQ Practice</Text>
        <Text style={styles.footerText}>Page 2</Text>
      </View>
    </Page>

    {/* Additional pages for more questions if needed */}
    {data.questions.length > 8 && (
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Question Breakdown (continued)</Text>
          
          {data.questions.slice(8).map((q) => (
            <View key={q.number} style={styles.questionItem}>
              <Text style={styles.questionNumber}>Question {q.number}</Text>
              <Text style={styles.questionText}>{q.text}</Text>
              
              <View style={styles.answerRow}>
                <Text style={styles.answerLabel}>Your Answer:</Text>
                <Text
                  style={[
                    styles.answerValue,
                    q.isCorrect ? styles.correct : styles.incorrect,
                  ]}
                >
                  {q.userAnswer || '(Not answered)'} {q.isCorrect ? '✓' : '✗'}
                </Text>
              </View>
              
              {!q.isCorrect && (
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Correct Answer:</Text>
                  <Text style={[styles.answerValue, styles.correct]}>
                    {q.correctAnswer}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>IELTS MCQ Practice</Text>
          <Text style={styles.footerText}>Page 3</Text>
        </View>
      </Page>
    )}
  </Document>
);

export default ResultPDFDocument;
