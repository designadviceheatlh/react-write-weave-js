
/**
 * Utilities for detecting list items in plain text
 */

/**
 * Determines if a line appears to be a list item and what type
 */
export const isListItem = (line) => {
  // Check for bullet list patterns
  const bulletPatterns = [
    /^[\s]*[-•*→➢▪▫⦿⦾✓✔︎✅][\s]+/,  // Common bullet characters
    /^[\s]*[○●◆◇■□▲△▼▽][\s]+/,     // More bullet symbols
  ];
  
  // Check for numbered list patterns
  const numberedPatterns = [
    /^[\s]*\d+[.)]\s+/,                  // Decimal numbers (1. 2. 3.)
    /^[\s]*[a-z][.)]\s+/i,               // Letters (a. b. c. or A. B. C.)
    /^[\s]*(?:(?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv)+)[.)]\s+/i,  // Roman numerals
  ];
  
  // Calculate indentation level
  const leadingSpacesMatch = line.match(/^(\s*)/);
  const leadingSpaces = leadingSpacesMatch ? leadingSpacesMatch[1].length : 0;
  const level = Math.floor(leadingSpaces / 2) + 1; // Rough estimate: 2 spaces = 1 level
  
  // Check all bullet patterns
  for (const pattern of bulletPatterns) {
    if (pattern.test(line)) {
      return { isList: true, type: 'ul', level };
    }
  }
  
  // Check all numbered patterns
  for (const pattern of numberedPatterns) {
    if (pattern.test(line)) {
      return { isList: true, type: 'ol', level };
    }
  }
  
  return { isList: false, type: '', level: 0 };
};
