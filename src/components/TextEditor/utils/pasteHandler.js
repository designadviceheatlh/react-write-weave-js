
import { sanitizePastedContent, validateContentLength } from './htmlSanitizer';

/**
 * Handles paste events in the editor with security sanitization
 */
export const handlePaste = (e, handleChange) => {
  e.preventDefault();
  
  // Get clipboard data
  const clipboardData = e.clipboardData;
  const html = clipboardData.getData('text/html');
  const text = clipboardData.getData('text/plain');
  
  let processedContent = '';
  
  if (html) {
    // Sanitize HTML content to prevent XSS
    const sanitizedHTML = sanitizePastedContent(html);
    processedContent = validateContentLength(sanitizedHTML);
    console.log('Sanitized HTML content:', processedContent);
  } else if (text) {
    // For plain text, escape HTML and convert to paragraphs
    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    // Convert line breaks to paragraphs
    const lines = escapedText.split(/\r?\n/).filter(line => line.trim() !== '');
    processedContent = lines.map(line => `<p>${line.trim()}</p>`).join('');
    processedContent = validateContentLength(processedContent);
    console.log('Processed plain text content:', processedContent);
  }
  
  // Safely insert content using insertHTML
  if (processedContent) {
    document.execCommand('insertHTML', false, processedContent);
  }
  
  // Trigger change handler
  handleChange();
};
