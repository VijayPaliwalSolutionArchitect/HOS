import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to locale string
 */
export function formatDate(date, options = {}) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
}

/**
 * Format time duration from seconds
 */
export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Format number with abbreviation (K, M, B)
 */
export function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Get XP needed for next level
 */
export function getXpForNextLevel(currentLevel) {
  return Math.pow(currentLevel, 2) * 100;
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty) {
  const colors = {
    EASY: 'text-green-500 bg-green-500/10',
    MEDIUM: 'text-yellow-500 bg-yellow-500/10',
    HARD: 'text-orange-500 bg-orange-500/10',
    EXPERT: 'text-red-500 bg-red-500/10',
  };
  return colors[difficulty] || colors.MEDIUM;
}

/**
 * Get status color
 */
export function getStatusColor(status) {
  const colors = {
    DRAFT: 'text-gray-500 bg-gray-500/10',
    PUBLISHED: 'text-blue-500 bg-blue-500/10',
    ACTIVE: 'text-green-500 bg-green-500/10',
    COMPLETED: 'text-purple-500 bg-purple-500/10',
    ARCHIVED: 'text-gray-500 bg-gray-500/10',
    IN_PROGRESS: 'text-yellow-500 bg-yellow-500/10',
    SUBMITTED: 'text-blue-500 bg-blue-500/10',
    EVALUATED: 'text-green-500 bg-green-500/10',
    EXPIRED: 'text-red-500 bg-red-500/10',
  };
  return colors[status] || colors.DRAFT;
}
