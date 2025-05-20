
/**
 * Utilities for detecting the source of content
 */

/**
 * Detects the source of pasted content based on HTML patterns
 */
export const detectContentSource = (html: string): string => {
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
  
  // Check for Outlook patterns
  if (
    html.includes('outlook') ||
    html.includes('urn:schemas-microsoft-com:office:office')
  ) return 'outlook';
  
  // If unknown, default to website
  return 'web';
};
