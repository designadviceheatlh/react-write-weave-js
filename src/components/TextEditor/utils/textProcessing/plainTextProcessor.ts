
/**
 * Utilities for processing plain text content into structured HTML
 */

import { isHeading } from './headingDetection';
import { isListItem } from './listDetection';
import { buildNestedListHTML } from './listBuilder';

/**
 * Converts plain text to structured HTML
 */
export const processPlainText = (text: string): string => {
  // Process line breaks to create paragraphs
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  
  let currentList: Array<{ content: string, type: string, level: number, style?: string }> = [];
  let html = '';
  let currentStyle = ''; // Track current text style (e.g., h1, h2, h3)
  
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
      
      // Set current style to heading
      currentStyle = `h${headingLevel}`;
      
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
      
      // Add to current list with current style
      currentList.push({ 
        content, 
        type: listType, 
        level: listLevel,
        style: currentStyle // Pass the current style to maintain heading/text styling
      });
    } else {
      // End any open list
      if (currentList.length > 0) {
        html += buildNestedListHTML(currentList);
        currentList = [];
      }
      
      // Set style to paragraph
      currentStyle = 'p';
      
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
