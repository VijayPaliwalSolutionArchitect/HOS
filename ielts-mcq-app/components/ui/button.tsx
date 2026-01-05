/**
 * Button Component
 * 
 * A versatile button component with multiple variants and sizes.
 * Uses class-variance-authority for variant management.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target',
  {
    variants: {
      variant: {
        // Primary gradient button
        default:
          'bg-gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
        // Destructive/danger button
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        // Outline button
        outline:
          'border-2 border-primary/30 bg-transparent text-foreground hover:bg-primary/10 hover:border-primary',
        // Secondary button
        secondary:
          'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20',
        // Ghost button
        ghost: 'hover:bg-accent/10 hover:text-accent-foreground',
        // Link style
        link: 'text-primary underline-offset-4 hover:underline',
        // Glass morphism button
        glass:
          'glass-card text-foreground hover:bg-white/20 dark:hover:bg-black/30',
        // Success button
        success:
          'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 shadow-emerald-500/25',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
