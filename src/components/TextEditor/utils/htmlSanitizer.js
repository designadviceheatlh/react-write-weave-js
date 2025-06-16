
/**
 * Secure HTML sanitization utility
 * Provides XSS protection for editor content
 */

// Fallback sanitization if DOMPurify is not available
const basicSanitize = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Remove script tags and dangerous attributes
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
};

/**
 * Configuration for HTML sanitization
 */
const SANITIZE_CONFIG = {
  // Allow only safe HTML elements
  ALLOWED_TAGS: [
    'p', 'div', 'span', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'hr',
    'mark' // For highlights
  ],
  
  // Allow only safe attributes
  ALLOWED_ATTR: [
    'class', 'data-highlight-color', 'data-highlight-id'
  ]
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  try {
    // Try to use DOMPurify if available
    if (typeof window !== 'undefined' && window.DOMPurify) {
      return window.DOMPurify.sanitize(html, {
        ALLOWED_TAGS: SANITIZE_CONFIG.ALLOWED_TAGS,
        ALLOWED_ATTR: SANITIZE_CONFIG.ALLOWED_ATTR,
        FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'style'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
      });
    }
  } catch (error) {
    console.warn('DOMPurify not available, using basic sanitization:', error);
  }
  
  // Fallback to basic sanitization
  return basicSanitize(html);
};

/**
 * Sanitizes pasted content with stricter rules
 */
export const sanitizePastedContent = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  try {
    // Try to use DOMPurify if available
    if (typeof window !== 'undefined' && window.DOMPurify) {
      return window.DOMPurify.sanitize(html, {
        ALLOWED_TAGS: SANITIZE_CONFIG.ALLOWED_TAGS,
        ALLOWED_ATTR: SANITIZE_CONFIG.ALLOWED_ATTR,
        FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button', 'iframe', 'frame', 'frameset', 'meta', 'link'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'style'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
      });
    }
  } catch (error) {
    console.warn('DOMPurify not available for paste sanitization, using basic sanitization:', error);
  }
  
  // Fallback to basic sanitization
  return basicSanitize(html);
};

/**
 * Validates and limits text content length
 */
export const validateContentLength = (content, maxLength = 100000) => {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  if (content.length > maxLength) {
    console.warn(`Content truncated: exceeded ${maxLength} characters`);
    return content.substring(0, maxLength);
  }
  
  return content;
};

/**
 * Checks if content contains potentially dangerous elements
 */
export const isContentSafe = (html) => {
  if (!html || typeof html !== 'string') {
    return true;
  }
  
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(html));
};
