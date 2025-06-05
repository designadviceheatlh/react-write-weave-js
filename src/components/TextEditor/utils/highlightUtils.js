
/**
 * Utility functions for text highlighting in review mode
 */

export const HIGHLIGHT_COLORS = {
  yellow: '#FEF08A',
  green: '#BBF7D0',
  blue: '#BFDBFE',
  pink: '#FBCFE8',
  orange: '#FED7AA'
};

export const HIGHLIGHT_CLASSES = {
  yellow: 'highlight-yellow',
  green: 'highlight-green',
  blue: 'highlight-blue',
  pink: 'highlight-pink',
  orange: 'highlight-orange'
};

/**
 * Highlight selected text with specified color
 */
export const highlightSelection = (color = 'yellow') => {
  const selection = window.getSelection();
  
  if (!selection.rangeCount || selection.isCollapsed) {
    return false;
  }

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  
  if (!selectedText.trim()) {
    return false;
  }

  // Create mark element with highlight class
  const mark = document.createElement('mark');
  mark.className = `text-highlight ${HIGHLIGHT_CLASSES[color]}`;
  mark.setAttribute('data-highlight-color', color);
  mark.setAttribute('data-highlight-id', Date.now().toString());
  
  try {
    range.surroundContents(mark);
    selection.removeAllRanges();
    return true;
  } catch (error) {
    // Handle complex selections by extracting and wrapping content
    const contents = range.extractContents();
    mark.appendChild(contents);
    range.insertNode(mark);
    selection.removeAllRanges();
    return true;
  }
};

/**
 * Remove highlight from selected text
 */
export const removeHighlight = () => {
  const selection = window.getSelection();
  
  if (!selection.rangeCount) {
    return false;
  }

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  
  // Find all mark elements in selection
  const marks = container.nodeType === Node.ELEMENT_NODE 
    ? container.querySelectorAll('mark.text-highlight')
    : container.parentElement?.querySelectorAll('mark.text-highlight') || [];

  let removed = false;
  marks.forEach(mark => {
    if (selection.containsNode(mark, true)) {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      removed = true;
    }
  });

  selection.removeAllRanges();
  return removed;
};

/**
 * Clear all highlights from the editor
 */
export const clearAllHighlights = (editorElement) => {
  if (!editorElement) return 0;
  
  const highlights = editorElement.querySelectorAll('mark.text-highlight');
  let count = 0;
  
  highlights.forEach(mark => {
    const parent = mark.parentNode;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
    count++;
  });
  
  return count;
};

/**
 * Get all highlights in the editor
 */
export const getAllHighlights = (editorElement) => {
  if (!editorElement) return [];
  
  const highlights = editorElement.querySelectorAll('mark.text-highlight');
  return Array.from(highlights).map(mark => ({
    id: mark.getAttribute('data-highlight-id'),
    color: mark.getAttribute('data-highlight-color'),
    text: mark.textContent,
    element: mark
  }));
};
