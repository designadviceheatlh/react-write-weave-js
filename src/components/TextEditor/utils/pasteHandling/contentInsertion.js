
/**
 * Inserts processed content at the cursor position
 */
export const insertContentAtCursor = (
  processedContent,
  fallbackText,
  targetElement
) => {
  const selection = window.getSelection();
  
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    
    if (processedContent) {
      const fragment = document.createRange().createContextualFragment(processedContent);
      range.insertNode(fragment);
    } else {
      // Fallback to plain text insertion if processing failed
      document.execCommand('insertText', false, fallbackText);
    }
    
    // Move cursor to end of inserted content
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  } else if (targetElement) {
    // If no selection, append to the end
    if (processedContent) {
      targetElement.innerHTML += processedContent;
    } else {
      // Fallback
      targetElement.innerHTML += fallbackText.replace(/\n/g, '<br>');
    }
  }
};
