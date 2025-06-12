
import DOMPurify from 'dompurify';

/**
 * Secure HTML sanitization configuration
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
  ],
  
  // Remove all scripts and dangerous elements
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'style'],
  
  // Remove all scripts
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
};

/**
 * Sanitizes pasted content with stricter rules
 */
export const sanitizePastedContent = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Even stricter config for pasted content
  const pasteConfig = {
    ...SANITIZE_CONFIG,
    // Remove more potentially dangerous elements for pasted content
    FORBID_TAGS: [...SANITIZE_CONFIG.FORBID_TAGS, 'iframe', 'frame', 'frameset', 'meta', 'link'],
    // Clean up Microsoft Word and other office suite artifacts
    CUSTOM_ELEMENT_HANDLING: {
      tagNameCheck: null,
      attributeNameCheck: null,
      allowCustomizedBuiltInElements: false,
    }
  };
  
  return DOMPurify.sanitize(html, pasteConfig);
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
