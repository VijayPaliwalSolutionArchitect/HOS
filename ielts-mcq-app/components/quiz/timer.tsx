/**
 * Timer Component
 * 
 * Displays countdown timer with progress ring.
 * Features warning states and animations.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerProps {
  remainingTime: number; // in seconds
  totalTime: number; // in seconds
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { ringSize: 60, strokeWidth: 4, fontSize: 'text-sm' },
  md: { ringSize: 80, strokeWidth: 5, fontSize: 'text-lg' },
  lg: { ringSize: 100, strokeWidth: 6, fontSize: 'text-xl' },
};

export function Timer({
  remainingTime,
  totalTime,
  isPaused,
  onPause,
  onResume,
  showControls = true,
  size = 'md',
  className,
}: TimerProps) {
  const { ringSize, strokeWidth, fontSize } = sizeConfig[size];
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (remainingTime / totalTime) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Determine warning state
  const isWarning = remainingTime <= 60 && remainingTime > 30;
  const isDanger = remainingTime <= 30;
  
  // Gradient colors based on state
  const getGradientColors = () => {
    if (isDanger) return ['#ef4444', '#f87171'];
    if (isWarning) return ['#f59e0b', '#fbbf24'];
    return ['#6366f1', '#ec4899'];
  };
  
  const [color1, color2] = getGradientColors();
  
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Timer ring */}
      <div className="relative">
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          className="transform -rotate-90"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color1} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          </defs>
          
          {/* Background track */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />
          
          {/* Progress arc */}
          <motion.circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isPaused ? (
              <motion.div
                key="paused"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Pause className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            ) : (
              <motion.div
                key="clock"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={cn(
                  isDanger && 'animate-pulse text-red-500',
                  isWarning && 'text-amber-500',
                  !isDanger && !isWarning && 'text-primary'
                )}
              >
                <Clock className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Time display */}
      <div className="flex flex-col">
        <motion.span
          className={cn(
            fontSize,
            'font-bold font-mono',
            isDanger && 'text-red-500',
            isWarning && 'text-amber-500',
            !isDanger && !isWarning && 'text-foreground'
          )}
          animate={isDanger ? { scale: [1, 1.1, 1] } : undefined}
          transition={isDanger ? { repeat: Infinity, duration: 1 } : undefined}
        >
          {formatTime(remainingTime)}
        </motion.span>
        <span className="text-xs text-muted-foreground">
          {isPaused ? 'Paused' : 'Remaining'}
        </span>
      </div>
      
      {/* Pause/Resume button */}
      {showControls && (
        <Button
          variant="ghost"
          size="icon"
          onClick={isPaused ? onResume : onPause}
          className="ml-2"
          aria-label={isPaused ? 'Resume quiz' : 'Pause quiz'}
        >
          {isPaused ? (
            <Play className="w-5 h-5" />
          ) : (
            <Pause className="w-5 h-5" />
          )}
        </Button>
      )}
    </div>
  );
}

export default Timer;
