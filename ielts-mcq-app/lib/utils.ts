import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 * 
 * @param inputs - Class names or conditional class objects
 * @returns Merged and deduplicated class string
 * 
 * @example
 * cn('px-4 py-2', isActive && 'bg-primary', 'hover:bg-muted')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as a percentage string
 * @param value - Number to format (0-100)
 * @param decimals - Number of decimal places
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format time in seconds to mm:ss string
 * @param seconds - Time in seconds
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format time in seconds to human readable string
 * @param seconds - Time in seconds
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Calculate IELTS band score from percentage
 * @param percentage - Score percentage (0-100)
 * @returns Band score (1-9)
 */
export function calculateBandScore(percentage: number): number {
  // IELTS band score mapping based on percentage
  if (percentage >= 95) return 9;
  if (percentage >= 87.5) return 8.5;
  if (percentage >= 80) return 8;
  if (percentage >= 72.5) return 7.5;
  if (percentage >= 65) return 7;
  if (percentage >= 57.5) return 6.5;
  if (percentage >= 50) return 6;
  if (percentage >= 42.5) return 5.5;
  if (percentage >= 35) return 5;
  if (percentage >= 27.5) return 4.5;
  if (percentage >= 20) return 4;
  if (percentage >= 15) return 3.5;
  if (percentage >= 10) return 3;
  if (percentage >= 5) return 2.5;
  if (percentage >= 2.5) return 2;
  return 1;
}

/**
 * Get band score color based on score
 * @param band - IELTS band score
 */
export function getBandColor(band: number): string {
  if (band >= 8) return 'text-emerald-500';
  if (band >= 7) return 'text-green-500';
  if (band >= 6) return 'text-yellow-500';
  if (band >= 5) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get band score background color
 * @param band - IELTS band score
 */
export function getBandBgColor(band: number): string {
  if (band >= 8) return 'bg-emerald-500/10';
  if (band >= 7) return 'bg-green-500/10';
  if (band >= 6) return 'bg-yellow-500/10';
  if (band >= 5) return 'bg-orange-500/10';
  return 'bg-red-500/10';
}

/**
 * Generate a random string for IDs
 * @param length - Length of the string
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Truncate string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Calculate XP for level
 * @param level - Current level
 * @returns XP needed for next level
 */
export function xpForLevel(level: number): number {
  // Exponential XP curve
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Calculate level from total XP
 * @param xp - Total XP points
 * @returns Current level
 */
export function levelFromXp(xp: number): number {
  let level = 1;
  let xpNeeded = 100;
  let totalXp = 0;
  
  while (totalXp + xpNeeded <= xp) {
    totalXp += xpNeeded;
    level++;
    xpNeeded = xpForLevel(level);
  }
  
  return level;
}

/**
 * Generate slug from string
 * @param str - String to slugify
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Sleep utility
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Capitalize first letter
 * @param str - String to capitalize
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
