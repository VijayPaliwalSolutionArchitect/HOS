import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

/**
 * Reusable Button component with multiple variants
 * Supports primary, secondary, outline, and ghost styles
 * 
 * @param {Object} props - Component props
 * @param {('primary'|'secondary'|'outline'|'ghost')} props.variant - Button style variant
 * @param {('sm'|'md'|'lg')} props.size - Button size
 * @param {boolean} props.disabled - Disabled state
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  className,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:opacity-90 hover:scale-105 focus:ring-[var(--color-primary)] shadow-lg hover:shadow-xl',
    secondary: 'bg-[var(--color-secondary)] text-white hover:opacity-90 hover:scale-105 focus:ring-[var(--color-secondary)] shadow-lg hover:shadow-xl',
    outline: 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white focus:ring-[var(--color-primary)]',
    ghost: 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] focus:ring-[var(--color-primary)]',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
