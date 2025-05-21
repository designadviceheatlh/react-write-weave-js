
import { cleanPastedHTML } from '../htmlCleaning';
import { processPlainText } from '../contentProcessing';
import { getInsertionContext } from './insertionContext';
import { insertContentAtCursor } from './contentInsertion';

/**
 * Handles paste events in the editor
 */
export const handlePaste = (
  e: React.ClipboardEvent<HTMLDivElement>,
  handleChange: () => void
): void => {
  e.preventDefault();
  
  // Get clipboard data
  const clipboardData = e.clipboardData;
  let html = clipboardData.getData('text/html');
  const text = clipboardData.getData('text/plain');
  
  // Process the pasted content based on what's available
  let processedContent = '';
  
  if (html) {
    processedContent = cleanPastedHTML(html);
    console.log('Processed HTML content:', processedContent);
  } else if (text) {
    // For plain text, try to detect structure and convert to HTML
    processedContent = processPlainText(text);
    console.log('Processed plain text content:', processedContent);
  }
  
  // Get insertion context to check if we're inside a list
  const inListContext = getInsertionContext();
  
  // Insert the processed content at cursor position
  insertContentAtCursor(processedContent, text, e.currentTarget);
  
  // Trigger change handler
  handleChange();
};
