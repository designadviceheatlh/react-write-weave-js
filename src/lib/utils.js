
/**
 * Utility functions for the application
 */

/**
 * Combine classes with filtering for falsy values
 * @param {...string} classes - List of classes to combine
 * @returns {string} - Combined class string
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
