
/**
 * Handles paste events in the editor
 */
export const handlePaste = (e, handleChange) => {
  e.preventDefault();
  
  // Get clipboard data
  const clipboardData = e.clipboardData;
  const html = clipboardData.getData('text/html');
  const text = clipboardData.getData('text/plain');
  
  // Simple paste handling - just insert the text/html
  if (html) {
    document.execCommand('insertHTML', false, html);
  } else if (text) {
    document.execCommand('insertText', false, text);
  }
  
  // Trigger change handler
  handleChange();
};
