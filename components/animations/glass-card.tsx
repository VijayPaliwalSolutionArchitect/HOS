/**
 * GlassCard Component
 * 
 * A card component with glassmorphism effect.
 * Features backdrop blur, gradient borders, and subtle shadows.
 */

'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  gradient = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass-card rounded-2xl p-6',
        hover && 'transition-all duration-300 hover:shadow-glass hover:-translate-y-1',
        glow && 'glow',
        gradient && 'bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/[0.02]',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default GlassCard;
