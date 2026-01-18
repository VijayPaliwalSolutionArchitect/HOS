/**
 * ProgressBar Component
 * 
 * Quiz progress indicator with question dots.
 * Features animated transitions and status indicators.
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Check, Flag, Circle } from 'lucide-react';

interface QuestionStatus {
  id: string;
  isAnswered: boolean;
  isFlagged: boolean;
  isCurrent: boolean;
}

interface ProgressBarProps {
  current: number;
  total: number;
  answered: number;
  questions: QuestionStatus[];
  onQuestionClick?: (index: number) => void;
  showDots?: boolean;
  className?: string;
}

export function ProgressBar({
  current,
  total,
  answered,
  questions,
  onQuestionClick,
  showDots = true,
  className,
}: ProgressBarProps) {
  const percentage = (answered / total) * 100;
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <Progress value={percentage} className="flex-1 h-2" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {answered}/{total} answered
        </span>
      </div>
      
      {/* Question dots */}
      {showDots && (
        <div className="flex flex-wrap gap-2 justify-center">
          {questions.map((q, index) => (
            <motion.button
              key={q.id}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                'transition-all duration-200 touch-target',
                q.isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                q.isAnswered && !q.isCurrent && 'bg-primary/20 text-primary',
                q.isFlagged && 'bg-amber-500/20 text-amber-600',
                !q.isAnswered && !q.isCurrent && 'bg-muted text-muted-foreground',
                'hover:scale-110'
              )}
              onClick={() => onQuestionClick?.(index)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Go to question ${index + 1}${q.isAnswered ? ', answered' : ''}${q.isFlagged ? ', flagged' : ''}`}
              aria-current={q.isCurrent ? 'step' : undefined}
            >
              {q.isAnswered ? (
                <Check className="w-4 h-4" />
              ) : q.isFlagged ? (
                <Flag className="w-3 h-3" />
              ) : (
                index + 1
              )}
            </motion.button>
          ))}
        </div>
      )}
      
      {/* Legend */}
      {showDots && (
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary/20" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500/20" />
            <span>Flagged</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span>Unanswered</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
