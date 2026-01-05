/**
 * MotionTimeline Component
 * 
 * Animated timeline for displaying quiz results or progress.
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, Flag } from 'lucide-react';

interface TimelineItem {
  id: string;
  number: number;
  isCorrect: boolean;
  timeSpent: number;
  flagged?: boolean;
}

interface MotionTimelineProps {
  items: TimelineItem[];
  onItemClick?: (index: number) => void;
  className?: string;
}

export function MotionTimeline({
  items,
  onItemClick,
  className,
}: MotionTimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Connection line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
      
      {/* Timeline items */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            className={cn(
              'relative flex items-center gap-4 pl-12 cursor-pointer',
              'transition-colors hover:bg-muted/50 rounded-lg p-2 -ml-2'
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onItemClick?.(index)}
          >
            {/* Icon */}
            <div
              className={cn(
                'absolute left-0 flex items-center justify-center w-12 h-12 rounded-full',
                item.isCorrect
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-red-500/10 text-red-500'
              )}
            >
              {item.isCorrect ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Question {item.number}</span>
                {item.flagged && (
                  <Flag className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{item.timeSpent}s</span>
              </div>
            </div>
            
            {/* Status badge */}
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                item.isCorrect
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-red-500/10 text-red-600'
              )}
            >
              {item.isCorrect ? 'Correct' : 'Incorrect'}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default MotionTimeline;
