
/**
 * Utilities for detecting and processing content from various sources
 */

// Simple content detection
export const detectContentSource = (html) => {
  // Check for PDF specific patterns
  if (html.includes('data-pdf-')) return 'pdf';
  
  // Check for common Word patterns
  if (
    html.includes('mso-') || 
    html.includes('word-wrap') || 
    html.includes('WordDocument')
  ) return 'word';
  
  // Check for Google Docs patterns
  if (
    html.includes('docs-') || 
    html.includes('kix-') || 
    html.includes('google-docs')
  ) return 'google-docs';
  
  // If unknown, default to website
  return 'web';
};

// Simple plain text processing
export const processPlainText = (text) => {
  // Convert line breaks to paragraphs
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  return lines.map(line => `<p>${line.trim()}</p>`).join('');
};
