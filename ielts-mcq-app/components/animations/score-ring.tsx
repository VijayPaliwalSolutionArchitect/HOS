/**
 * ScoreRing Component
 * 
 * Circular progress indicator for displaying scores.
 * Animated with gradient stroke.
 */

'use client';

import { motion } from 'framer-motion';
import { cn, getBandColor } from '@/lib/utils';

interface ScoreRingProps {
  score: number; // 0-100 percentage or 1-9 band score
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  isBandScore?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { size: 80, fontSize: 'text-lg' },
  md: { size: 120, fontSize: 'text-2xl' },
  lg: { size: 160, fontSize: 'text-4xl' },
  xl: { size: 200, fontSize: 'text-5xl' },
};

export function ScoreRing({
  score,
  maxScore = 100,
  size = 'md',
  strokeWidth = 8,
  showLabel = true,
  label,
  isBandScore = false,
  className,
}: ScoreRingProps) {
  const { size: ringSize, fontSize } = sizeConfig[size];
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate percentage
  const percentage = isBandScore 
    ? (score / 9) * 100 
    : (score / maxScore) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Display value
  const displayValue = isBandScore ? score.toFixed(1) : Math.round(score);
  
  return (
    <div className={cn('score-ring', className)}>
      <svg
        width={ringSize}
        height={ringSize}
        viewBox={`0 0 ${ringSize} ${ringSize}`}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        
        {/* Background track */}
        <circle
          className="track"
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress arc */}
        <motion.circle
          className="progress"
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn(
            fontSize,
            'font-bold',
            isBandScore ? getBandColor(score) : 'text-gradient'
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        >
          {displayValue}
          {!isBandScore && <span className="text-muted-foreground text-sm">%</span>}
        </motion.span>
        {showLabel && label && (
          <span className="text-xs text-muted-foreground mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}

export default ScoreRing;
