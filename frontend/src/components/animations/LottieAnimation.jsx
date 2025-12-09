import { forwardRef } from 'react';
import Lottie from 'lottie-react';
import clsx from 'clsx';

/**
 * LottieAnimation wrapper component
 * Provides a reusable component for Lottie animations
 * 
 * @param {Object} props - Component props
 * @param {Object} props.animationData - Lottie animation JSON data
 * @param {boolean} props.loop - Whether to loop the animation
 * @param {boolean} props.autoplay - Whether to autoplay the animation
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.width - Animation width
 * @param {number} props.height - Animation height
 * @param {Function} props.onComplete - Callback when animation completes
 */
const LottieAnimation = forwardRef(({
  animationData,
  loop = true,
  autoplay = true,
  className,
  width,
  height,
  onComplete,
  ...props
}, ref) => {
  if (!animationData) {
    return (
      <div
        className={clsx('flex items-center justify-center', className)}
        style={{ width, height }}
      >
        <p className="text-[var(--text-secondary)]">No animation data</p>
      </div>
    );
  }

  const style = {
    width: width || '100%',
    height: height || '100%',
  };

  return (
    <div ref={ref} className={clsx('lottie-container', className)}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={style}
        onComplete={onComplete}
        {...props}
      />
    </div>
  );
});

LottieAnimation.displayName = 'LottieAnimation';

export default LottieAnimation;
