/**
 * Timer Hook
 * 
 * Manages countdown timer for quiz sessions.
 * Handles pause/resume and auto-submit on timeout.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQuizStore, useRemainingTime } from './useQuiz';

interface UseTimerOptions {
  onTimeUp?: () => void;
  warningThreshold?: number; // seconds before warning
  onWarning?: () => void;
}

export function useTimer(options: UseTimerOptions = {}) {
  const { onTimeUp, warningThreshold = 60, onWarning } = options;
  
  const {
    isStarted,
    isPaused,
    isCompleted,
    elapsedTime,
    duration,
    updateElapsedTime,
  } = useQuizStore();
  
  const remainingTime = useRemainingTime();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningFiredRef = useRef(false);
  
  // Format time as mm:ss
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // Start/stop timer based on quiz state
  useEffect(() => {
    if (isStarted && !isPaused && !isCompleted) {
      // Start timer
      intervalRef.current = setInterval(() => {
        useQuizStore.setState((state) => ({
          elapsedTime: state.elapsedTime + 1,
        }));
      }, 1000);
    } else {
      // Stop timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStarted, isPaused, isCompleted]);
  
  // Check for time up
  useEffect(() => {
    if (remainingTime <= 0 && isStarted && !isCompleted) {
      onTimeUp?.();
    }
  }, [remainingTime, isStarted, isCompleted, onTimeUp]);
  
  // Check for warning threshold
  useEffect(() => {
    if (
      remainingTime <= warningThreshold &&
      remainingTime > 0 &&
      !warningFiredRef.current &&
      isStarted &&
      !isCompleted
    ) {
      warningFiredRef.current = true;
      onWarning?.();
    }
  }, [remainingTime, warningThreshold, isStarted, isCompleted, onWarning]);
  
  // Reset warning flag when quiz resets
  useEffect(() => {
    if (!isStarted) {
      warningFiredRef.current = false;
    }
  }, [isStarted]);
  
  return {
    remainingTime,
    elapsedTime,
    formattedRemaining: formatTime(remainingTime),
    formattedElapsed: formatTime(elapsedTime),
    isWarning: remainingTime <= warningThreshold && remainingTime > 0,
    isDanger: remainingTime <= 30 && remainingTime > 0,
    isTimeUp: remainingTime <= 0,
    progress: duration > 0 ? ((duration * 60 - remainingTime) / (duration * 60)) * 100 : 0,
  };
}

export default useTimer;
