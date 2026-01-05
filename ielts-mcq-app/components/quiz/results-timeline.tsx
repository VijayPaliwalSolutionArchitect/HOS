/**
 * ResultsTimeline Component
 * 
 * Displays quiz results in a timeline format.
 * Shows each question's result with correct/incorrect status.
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, ChevronRight, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultItem {
  questionNumber: number;
  questionText: string;
  isCorrect: boolean;
  timeSpent: number;
  userAnswer: string | null;
  correctAnswer: string;
  flagged?: boolean;
}

interface ResultsTimelineProps {
  results: ResultItem[];
  onViewQuestion?: (index: number) => void;
  className?: string;
}

export function ResultsTimeline({
  results,
  onViewQuestion,
  className,
}: ResultsTimelineProps) {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const incorrectCount = results.length - correctCount;
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary */}
      <div className="flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="font-semibold text-emerald-600">{correctCount} Correct</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-red-600">{incorrectCount} Incorrect</span>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        
        {/* Items */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={index}
              className={cn(
                'relative flex items-start gap-4 pl-14',
                'transition-colors rounded-lg p-3 -ml-3',
                'hover:bg-muted/50 cursor-pointer'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onViewQuestion?.(index)}
            >
              {/* Icon */}
              <div
                className={cn(
                  'absolute left-0 flex items-center justify-center w-12 h-12 rounded-full',
                  'border-4 border-background',
                  result.isCorrect
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                )}
              >
                {result.isCorrect ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">
                    Question {result.questionNumber}
                  </span>
                  {result.flagged && (
                    <Flag className="w-4 h-4 text-amber-500 fill-amber-500" />
                  )}
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      result.isCorrect
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-red-500/10 text-red-600'
                    )}
                  >
                    {result.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {result.questionText}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {result.timeSpent}s
                  </span>
                  {!result.isCorrect && (
                    <span>
                      Your answer: <span className="text-red-600">{result.userAnswer || 'Not answered'}</span>
                    </span>
                  )}
                </div>
              </div>
              
              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResultsTimeline;
