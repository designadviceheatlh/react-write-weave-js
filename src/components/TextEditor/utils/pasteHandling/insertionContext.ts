
/**
 * Checks if the cursor is currently positioned inside a list element
 */
export const getInsertionContext = (): { inList: boolean, listType: string | null } => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return { inList: false, listType: null };
  }
  
  let node = selection.getRangeAt(0).startContainer;
  
  // If we're in a text node, get its parent
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }
  
  // Check if we're inside a list element
  let parentElement = node as HTMLElement;
  while (parentElement) {
    if (parentElement.tagName === 'LI') {
      const listParent = parentElement.parentElement;
      return { 
        inList: true, 
        listType: listParent?.tagName.toLowerCase() || null 
      };
    }
    
    if (parentElement.tagName === 'BODY' || !parentElement.parentElement) {
      break;
    }
    parentElement = parentElement.parentElement;
  }
  
  return { inList: false, listType: null };
};
