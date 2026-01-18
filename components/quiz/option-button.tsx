/**
 * OptionButton Component
 * 
 * Individual answer option with selection states.
 * Features hover effects and result feedback.
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface OptionButtonProps {
  option: Option;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  showResult?: boolean;
  disabled?: boolean;
}

// Option labels (A, B, C, D, etc.)
const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

export function OptionButton({
  option,
  index,
  isSelected,
  onSelect,
  showResult = false,
  disabled = false,
}: OptionButtonProps) {
  // Determine state for styling
  const isCorrect = showResult && option.isCorrect;
  const isIncorrect = showResult && isSelected && !option.isCorrect;
  
  return (
    <motion.button
      className={cn(
        'option-button w-full flex items-center gap-4 p-4 rounded-xl text-left',
        'bg-card border-2 transition-all duration-200',
        !showResult && !disabled && 'hover:border-primary/50 hover:bg-primary/5',
        isSelected && !showResult && 'selected border-primary bg-primary/10',
        isCorrect && 'correct border-emerald-500 bg-emerald-500/10',
        isIncorrect && 'incorrect border-red-500 bg-red-500/10',
        disabled && 'cursor-default'
      )}
      onClick={onSelect}
      disabled={disabled}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      role="radio"
      aria-checked={isSelected}
    >
      {/* Option label */}
      <span
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          'text-sm font-bold transition-colors duration-200',
          !isSelected && !showResult && 'bg-muted text-muted-foreground',
          isSelected && !showResult && 'bg-primary text-primary-foreground',
          isCorrect && 'bg-emerald-500 text-white',
          isIncorrect && 'bg-red-500 text-white'
        )}
      >
        {showResult ? (
          isCorrect ? (
            <Check className="w-5 h-5" />
          ) : isIncorrect ? (
            <X className="w-5 h-5" />
          ) : (
            optionLabels[index]
          )
        ) : (
          optionLabels[index]
        )}
      </span>
      
      {/* Option text */}
      <span
        className={cn(
          'flex-1 text-base',
          isCorrect && 'text-emerald-700 dark:text-emerald-300 font-medium',
          isIncorrect && 'text-red-700 dark:text-red-300'
        )}
      >
        {option.text}
      </span>
      
      {/* Selection indicator */}
      {isSelected && !showResult && (
        <motion.div
          className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <Check className="w-4 h-4 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}

export default OptionButton;
