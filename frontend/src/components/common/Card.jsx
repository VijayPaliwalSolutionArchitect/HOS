import { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Animated Card component
 * Provides a container with hover effects and animations
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hoverable - Enable hover animation
 * @param {boolean} props.clickable - Enable clickable styles
 */
const Card = forwardRef(({
  children,
  className,
  hoverable = true,
  clickable = false,
  ...props
}, ref) => {
  const baseStyles = 'bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 transition-all duration-300';
  
  const hoverStyles = hoverable ? 'hover:shadow-2xl hover:-translate-y-2 hover:border-[var(--color-primary)]' : '';
  
  const clickableStyles = clickable ? 'cursor-pointer active:scale-95' : '';
  
  return (
    <div
      ref={ref}
      className={clsx(
        baseStyles,
        hoverStyles,
        clickableStyles,
        'animate-fade-in',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
