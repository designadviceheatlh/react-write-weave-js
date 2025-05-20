
/**
 * Utilities for detecting and processing content from various sources
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

/**
 * Converts plain text to structured HTML
 */
export const processPlainText = (text: string): string => {
  // Process line breaks to create paragraphs
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  
  // Detect if this might be a list
  const isListItem = (line: string): { isList: boolean, type: string, level: number } => {
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
    const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0;
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
  
  // Detect heading patterns
  const isHeading = (line: string, surroundingLines: string[]): { isHeading: boolean, level: number } => {
    const lineIndex = surroundingLines.indexOf(line);
    
    // Check for # markdown style headings
    if (/^#{1,6}\s+/.test(line)) {
      const level = line.match(/^(#{1,6})\s+/)?.[1].length || 1;
      return { isHeading: true, level: Math.min(level, 6) };
    }
    
    // Check for shorter surrounding lines
    if (line.length > 10 && 
        lineIndex > 0 && 
        surroundingLines[lineIndex-1].trim().length === 0 && 
        (lineIndex === surroundingLines.length-1 || surroundingLines[lineIndex+1].trim().length === 0)) {
      return { isHeading: true, level: line.length > 20 ? 3 : 2 };
    }
    
    // Check for ALL CAPS patterns which are often headings
    if (line.toUpperCase() === line && line.length > 3 && line.match(/[A-Z]/)) {
      return { isHeading: true, level: line.length > 20 ? 2 : 1 };
    }
    
    return { isHeading: false, level: 0 };
  };
  
  /**
   * Builds nested list HTML from a list of items
   */
  const buildNestedListHTML = (items: Array<{ content: string, type: string, level: number }>) => {
    // Create root list container based on first item's type
    let html = `<${items[0].type}>`;
    
    // Current state
    let currentLevel = 1;
    let listStack = [items[0].type];  // Stack to track open list tags
    
    for (let i = 0; i < items.length; i++) {
      const { content, type, level } = items[i];
      
      // Handle level changes
      if (level > currentLevel) {
        // Going deeper - open new nested list
        for (let l = currentLevel; l < level; l++) {
          html += `<${type}>`;
          listStack.push(type);
        }
      } else if (level < currentLevel) {
        // Going back up - close lists
        for (let l = currentLevel; l > level; l--) {
          html += `</${listStack.pop()}>`;
        }
      }
      
      // Add list item
      html += `<li>${content}</li>`;
      
      // If next item has different type or is not a list, close current list
      if (i === items.length - 1 || 
          items[i+1].level < level) {
        // Close lists up to target level
        const targetLevel = i === items.length - 1 ? 0 : items[i+1].level;
        for (let l = level; l > targetLevel; l--) {
          html += `</${listStack.pop()}>`;
        }
      }
      
      // Update current level
      currentLevel = level;
    }
    
    // Close any remaining open lists
    while (listStack.length > 0) {
      html += `</${listStack.pop()}>`;
    }
    
    return html;
  };
  
  let currentList: Array<{ content: string, type: string, level: number }> = [];
  let html = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const { isHeading: isHead, level: headingLevel } = isHeading(line, lines);
    const { isList, type: listType, level: listLevel } = isListItem(line);
    
    if (isHead) {
      // End any open list
      if (currentList.length > 0) {
        html += buildNestedListHTML(currentList);
        currentList = [];
      }
      
      // Add heading
      html += `<h${headingLevel}>${line.trim().replace(/^#+\s+/, '')}</h${headingLevel}>`;
    } else if (isList) {
      // Extract list item content
      let content = '';
      if (listType === 'ul') {
        content = line.replace(/^[\s]*[-•*→➢▪▫⦿⦾✓✔︎✅○●◆◇■□▲△▼▽][\s]+/, '');
      } else {
        content = line.replace(/^[\s]*(?:\d+|[a-z]+|(?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv)+)[.)]\s+/i, '');
      }
      
      // Add to current list
      currentList.push({ content, type: listType, level: listLevel });
    } else {
      // End any open list
      if (currentList.length > 0) {
        html += buildNestedListHTML(currentList);
        currentList = [];
      }
      
      // Regular paragraph
      html += `<p>${line.trim()}</p>`;
    }
  }
  
  // Close any open lists
  if (currentList.length > 0) {
    html += buildNestedListHTML(currentList);
  }
  
  return html;
};
