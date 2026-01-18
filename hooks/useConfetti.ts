/**
 * Confetti Hook
 * 
 * Triggers celebration confetti animation using canvas-confetti.
 * Used for quiz completion and achievement unlocks.
 */

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
}

export function useConfetti() {
  /**
   * Fire basic confetti burst
   */
  const fireConfetti = useCallback((options: ConfettiOptions = {}) => {
    const defaults: ConfettiOptions = {
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'],
    };
    
    confetti({
      ...defaults,
      ...options,
    });
  }, []);
  
  /**
   * Fire celebration confetti (multiple bursts)
   */
  const fireCelebration = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#6366f1', '#ec4899', '#10b981'];
    
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      
      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, []);
  
  /**
   * Fire fireworks effect
   */
  const fireFireworks = useCallback(() => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };
    
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      
      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#6366f1', '#818cf8'],
      });
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ec4899', '#f472b6'],
      });
    }, 250);
  }, []);
  
  /**
   * Fire stars effect (for achievements)
   */
  const fireStars = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ['#ffd700', '#ffec8b', '#fff8dc'],
    };
    
    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star'],
      });
      
      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ['circle'],
      });
    };
    
    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }, []);
  
  /**
   * Fire emoji rain
   */
  const fireEmoji = useCallback((emoji: string = '🎉') => {
    const scalar = 2;
    const unicorn = confetti.shapeFromText({ text: emoji, scalar });
    
    confetti({
      shapes: [unicorn],
      scalar,
      particleCount: 30,
      spread: 60,
      origin: { y: 0.3 },
    });
  }, []);
  
  return {
    fireConfetti,
    fireCelebration,
    fireFireworks,
    fireStars,
    fireEmoji,
  };
}

export default useConfetti;
