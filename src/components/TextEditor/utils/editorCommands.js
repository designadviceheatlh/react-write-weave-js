
/**
 * Executes a document command in the content editable area
 */
export const executeCommand = (command, value = null, handleChange) => {
  document.execCommand(command, false, value);
  
  if (handleChange) {
    handleChange();
  }
};

/**
 * Handles undo operation
 */
export const handleUndo = (handleChange) => {
  executeCommand('undo', null, handleChange);
};

/**
 * Handles redo operation
 */
export const handleRedo = (handleChange) => {
  executeCommand('redo', null, handleChange);
};

/**
 * Applies bold with font-weight: 600 to selected text
 */
export const handleBold = (handleChange) => {
  // First apply the standard bold command
  executeCommand('bold', null, handleChange);
  
  // Then ensure all <b> and <strong> elements use font-weight: 600
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const strongElements = document.querySelectorAll('b, strong');
    strongElements.forEach(el => {
      if (range.intersectsNode(el)) {
        el.style.fontWeight = '600';
      }
    });
  }
};

/**
 * Handles inserting a divider
 */
export const handleInsertDivider = (handleChange) => {
  executeCommand('insertHTML', '<hr>', handleChange);
};

/**
 * Handles list indentation
 */
export const handleListIndentation = (isShiftPressed, handleChange) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  
  let node = selection.getRangeAt(0).startContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }
  
  // Check if we're inside a list item
  let listItem = node;
  while (listItem && listItem.tagName !== 'LI') {
    listItem = listItem.parentElement;
    if (!listItem || listItem.tagName === 'BODY') return false;
  }
  
  if (listItem) {
    if (isShiftPressed) {
      // Outdent
      executeCommand('outdent', null, handleChange);
    } else {
      // Indent
      executeCommand('indent', null, handleChange);
    }
    return true;
  }
  
  return false;
};
