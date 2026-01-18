/**
 * ConfettiCanvas Component
 * 
 * Canvas-based confetti animation for celebrations.
 * Triggered on quiz completion and achievements.
 */

'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCanvasProps {
  trigger?: boolean;
  type?: 'burst' | 'celebration' | 'fireworks' | 'stars';
  duration?: number;
  colors?: string[];
}

export function ConfettiCanvas({
  trigger = false,
  type = 'celebration',
  duration = 3000,
  colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'],
}: ConfettiCanvasProps) {
  const hasTriggered = useRef(false);
  
  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;
      
      switch (type) {
        case 'burst':
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors,
          });
          break;
          
        case 'celebration': {
          const animationEnd = Date.now() + duration;
          
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
          break;
        }
          
        case 'fireworks': {
          const animationEnd = Date.now() + duration;
          const defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 9999,
          };
          
          const randomInRange = (min: number, max: number) =>
            Math.random() * (max - min) + min;
          
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
              colors: colors.slice(0, 2),
            });
            
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
              colors: colors.slice(2),
            });
          }, 250);
          break;
        }
          
        case 'stars': {
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
          break;
        }
      }
    }
  }, [trigger, type, duration, colors]);
  
  // Reset trigger tracking
  useEffect(() => {
    if (!trigger) {
      hasTriggered.current = false;
    }
  }, [trigger]);
  
  return null; // Uses the default canvas from canvas-confetti
}

export default ConfettiCanvas;
