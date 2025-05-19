
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
  const isListItem = (line: string): boolean => {
    return /^[\s]*[-•*][\s]+/.test(line) || // Bullet list
           /^[\s]*\d+[.)]\s+/.test(line);   // Numbered list
  };
  
  // Detect heading patterns
  const isHeading = (line: string, surroundingLines: string[]): { isHeading: boolean, level: number } => {
    const lineIndex = surroundingLines.indexOf(line);
    
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
  
  let inList = false;
  let listItems: string[] = [];
  let listType = '';
  let html = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const { isHeading: isHead, level } = isHeading(line, lines);
    const isItem = isListItem(line);
    
    if (isHead) {
      // End any open list
      if (inList) {
        html += `<${listType}>${listItems.join('')}</${listType}>`;
        listItems = [];
        inList = false;
      }
      
      // Add heading
      html += `<h${level}>${line.trim().replace(/^#+\s+/, '')}</h${level}>`;
    } else if (isItem) {
      // Detect list type
      const newListType = /^[\s]*\d+/.test(line) ? 'ol' : 'ul';
      
      // If we're changing list types, end the current list
      if (inList && listType !== newListType) {
        html += `<${listType}>${listItems.join('')}</${listType}>`;
        listItems = [];
      }
      
      inList = true;
      listType = newListType;
      
      // Format the list item
      const cleanItem = line
        .replace(/^[\s]*[-•*][\s]+/, '')
        .replace(/^[\s]*\d+[.)]\s+/, '');
      listItems.push(`<li>${cleanItem}</li>`);
    } else {
      // End any open list
      if (inList) {
        html += `<${listType}>${listItems.join('')}</${listType}>`;
        listItems = [];
        inList = false;
      }
      
      // Regular paragraph
      html += `<p>${line.trim()}</p>`;
    }
  }
  
  // Close any open lists
  if (inList) {
    html += `<${listType}>${listItems.join('')}</${listType}>`;
  }
  
  return html;
};
