
import { cleanPastedHTML } from './htmlCleaning';
import { processPlainText } from './contentProcessing';

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
  } else if (text) {
    // For plain text, try to detect structure and convert to HTML
    processedContent = processPlainText(text);
  }
  
  // Insert the processed content at cursor position
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    
    if (processedContent) {
      const fragment = document.createRange().createContextualFragment(processedContent);
      range.insertNode(fragment);
    } else {
      // Fallback to plain text insertion if processing failed
      document.execCommand('insertText', false, text);
    }
    
    // Move cursor to end of inserted content
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  } else if (e.currentTarget) {
    // If no selection, append to the end
    if (processedContent) {
      e.currentTarget.innerHTML += processedContent;
    } else {
      // Fallback
      e.currentTarget.innerHTML += text.replace(/\n/g, '<br>');
    }
  }
  
  // Trigger change handler
  handleChange();
};
