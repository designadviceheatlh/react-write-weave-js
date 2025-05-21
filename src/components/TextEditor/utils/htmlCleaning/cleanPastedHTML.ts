import { detectContentSource } from '../contentProcessing';
import { convertDivsToParagraphs } from './formatConverters';
import { detectAndFixLists, processNestedLists, fixListStructure } from './listProcessing';
import { processTables } from './tableProcessing';
import { handlePdfLineBreaks } from './sourceSpecificProcessing';
import { applyFormattingFromStyles } from './styleProcessing';
import { normalizeParaElements, cleanEmptyParagraphs } from './paragraphProcessing';

/**
 * Cleans HTML content from paste operations, maintaining semantic structure
 */
export const cleanPastedHTML = (html: string): string => {
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Detect content source
  const contentSource = detectContentSource(html);
  
  // Remove all style attributes and classes
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach(el => {
    // For specific content sources, we might want to preserve some attributes
    if (contentSource !== 'pdf') {
      el.removeAttribute('style');
    }
    el.removeAttribute('class');
    
    // Keep only attributes we want
    const attributesToKeep = ['src', 'href', 'alt', 'colspan', 'rowspan'];
    const attributes = Array.from(el.attributes);
    attributes.forEach(attr => {
      if (!attributesToKeep.includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });
    
    // Mark the element with data source for specific CSS treatment
    el.setAttribute('data-source', contentSource);
  });
  
  // Process lists from various sources
  detectAndFixLists(tempDiv, contentSource);
  
  // Handle tables better
  processTables(tempDiv);
  
  // Handle line breaks in PDF content
  if (contentSource === 'pdf') {
    handlePdfLineBreaks(tempDiv);
  }
  
  // Convert divs to paragraphs and apply formatting
  convertDivsToParagraphs(tempDiv, contentSource);
  
  // Apply formatting based on text styles for web content
  if (contentSource === 'web' || contentSource === 'word') {
    applyFormattingFromStyles(tempDiv);
  }
  
  // Unified paragraph handling
  normalizeParaElements(tempDiv);
  
  // Clean empty paragraphs
  cleanEmptyParagraphs(tempDiv);
  
  return tempDiv.innerHTML;
};
