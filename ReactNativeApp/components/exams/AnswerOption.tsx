import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '../ui/Text';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { QuestionOption } from '@/types';

interface AnswerOptionProps {
  option: QuestionOption;
  index: number;
  isSelected: boolean;
  isMultiple: boolean;
  onPress: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  option,
  index,
  isSelected,
  isMultiple,
  onPress,
}) => {
  const { colors } = useTheme();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? colors.primary + '10' : colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: isSelected ? colors.primary : 'transparent',
            borderColor: isSelected ? colors.primary : colors.border,
          },
          !isMultiple && styles.indicatorCircle,
        ]}
      >
        {isSelected && (
          <Ionicons
            name={isMultiple ? 'checkmark' : 'radio-button-on'}
            size={16}
            color="#FFFFFF"
          />
        )}
      </View>
      <View style={styles.labelContainer}>
        <Text
          variant="body"
          weight="semibold"
          style={[
            styles.label,
            { color: isSelected ? colors.primary : colors.text.secondary },
          ]}
        >
          {OPTION_LABELS[index]}
        </Text>
      </View>
      <Text
        variant="body"
        style={[
          styles.text,
          { color: isSelected ? colors.text.primary : colors.text.secondary },
        ]}
      >
        {option.text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    ...theme.shadows.sm,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  indicatorCircle: {
    borderRadius: theme.borderRadius.full,
  },
  labelContainer: {
    marginRight: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.lg,
  },
  text: {
    flex: 1,
    lineHeight: theme.lineHeights.relaxed * theme.fontSizes.base,
  },
});
