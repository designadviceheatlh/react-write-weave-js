
import { sanitizeHTML } from './htmlSanitizer';

/**
 * Clean pasted HTML with security sanitization
 */
export const cleanPastedHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Use the secure sanitizer instead of manual cleaning
  return sanitizeHTML(html);
};
