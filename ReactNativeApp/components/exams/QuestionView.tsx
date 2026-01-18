import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { AnswerOption } from './AnswerOption';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { Question } from '@/types';

interface QuestionViewProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string | string[];
  onAnswerSelect: (answer: string | string[]) => void;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
}) => {
  const { colors } = useTheme();

  const handleOptionPress = (optionId: string) => {
    if (question.question_type === 'multiple_choice') {
      // Handle multiple choice
      const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [];
      if (currentAnswers.includes(optionId)) {
        onAnswerSelect(currentAnswers.filter((id) => id !== optionId));
      } else {
        onAnswerSelect([...currentAnswers, optionId]);
      }
    } else {
      // Handle single choice
      onAnswerSelect(optionId);
    }
  };

  const isSelected = (optionId: string): boolean => {
    if (Array.isArray(selectedAnswer)) {
      return selectedAnswer.includes(optionId);
    }
    return selectedAnswer === optionId;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text variant="caption" color="secondary">
          Question {questionNumber} of {totalQuestions}
        </Text>
        {question.points && (
          <View
            style={[
              styles.pointsBadge,
              { backgroundColor: colors.accent + '15' },
            ]}
          >
            <Text
              variant="caption"
              style={{
                color: colors.accent,
                fontWeight: theme.fontWeights.semibold,
              }}
            >
              {question.points} pts
            </Text>
          </View>
        )}
      </View>

      <Card variant="elevated" padding="lg">
        <Text variant="h4" weight="medium" style={styles.questionText}>
          {question.question_text}
        </Text>
        {question.question_type === 'multiple_choice' && (
          <Text variant="caption" color="secondary" style={styles.hint}>
            Select all that apply
          </Text>
        )}
      </Card>

      <View style={styles.options}>
        {question.options.map((option, index) => (
          <AnswerOption
            key={option.id}
            option={option}
            index={index}
            isSelected={isSelected(option.id)}
            isMultiple={question.question_type === 'multiple_choice'}
            onPress={() => handleOptionPress(option.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  pointsBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
  },
  questionText: {
    lineHeight: theme.lineHeights.relaxed * theme.fontSizes['2xl'],
  },
  hint: {
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  options: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
});
