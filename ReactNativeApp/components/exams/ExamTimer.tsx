import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { formatDuration } from '@/lib/utils';
import { useExamStore } from '@/store/examStore';

interface ExamTimerProps {
  onTimeUp?: () => void;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({ onTimeUp }) => {
  const { colors } = useTheme();
  const { timeRemaining, decrementTime, currentExam } = useExamStore();

  useEffect(() => {
    if (!currentExam?.is_timed) return;

    const interval = setInterval(() => {
      decrementTime();
      if (timeRemaining <= 1 && onTimeUp) {
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, currentExam]);

  if (!currentExam?.is_timed) return null;

  const isWarning = timeRemaining <= 300; // 5 minutes
  const isCritical = timeRemaining <= 60; // 1 minute

  const getTimerColor = () => {
    if (isCritical) return colors.error;
    if (isWarning) return colors.warning;
    return colors.text.secondary;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: getTimerColor(),
        },
        (isWarning || isCritical) && styles.warningBorder,
      ]}
    >
      <Ionicons name="time" size={20} color={getTimerColor()} />
      <Text
        variant="body"
        weight="semibold"
        style={{ color: getTimerColor() }}
      >
        {formatDuration(timeRemaining)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    ...theme.shadows.sm,
  },
  warningBorder: {
    borderWidth: 2,
  },
});
