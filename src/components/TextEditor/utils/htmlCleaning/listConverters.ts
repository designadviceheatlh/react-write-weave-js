
/**
 * Converts Microsoft Word list paragraphs to proper HTML lists
 */
export const convertMsoListToProperList = (items: NodeListOf<Element>): void => {
  let currentList: HTMLElement | null = null;
  let isOrdered = false;
  let lastLevel = 0;
  
  items.forEach((item) => {
    // Determine if it's a numbered list based on content or style attributes
    const content = item.textContent || '';
    const isBullet = /^[•\-\*\u2022\u25E6\u25AA]/.test(content.trim());
    const isNumber = /^\d+[.)]/.test(content.trim());
    
    // Get list level (for nested lists) - simplified approach
    const styleAttr = item.getAttribute('style') || '';
    const levelMatch = styleAttr.match(/level(\d+)/);
    const level = levelMatch ? parseInt(levelMatch[1]) : 1;
    
    // Determine list type
    isOrdered = isNumber;
    
    // Create new list if needed
    if (!currentList || (level !== lastLevel)) {
      const listType = isOrdered ? 'ol' : 'ul';
      const newList = document.createElement(listType);
      
      // Handle nesting
      if (level > lastLevel) {
        // Create a nested list
        const parentItem = currentList?.lastElementChild;
        if (parentItem) {
          parentItem.appendChild(newList);
        } else {
          // Fallback if no parent item
          item.parentElement?.insertBefore(newList, item);
        }
      } else {
        // Same level or going back up
        item.parentElement?.insertBefore(newList, item);
      }
      
      currentList = newList;
    }
    
    // Create li element
    const li = document.createElement('li');
    
    // Clean the content (remove bullets/numbers)
    const cleanContent = content.replace(/^[•\-\*\u2022\u25E6\u25AA\d+[.)]\s]+/, '').trim();
    li.textContent = cleanContent;
    
    // Add to list
    if (currentList) {
      currentList.appendChild(li);
    }
    
    // Remove the original item
    item.parentElement?.removeChild(item);
    
    lastLevel = level;
  });
};

/**
 * Converts a sequence of elements to a proper list
 */
export const convertElementSequenceToList = (items: Element[], isOrdered: boolean): void => {
  if (items.length === 0) return;
  
  // Create a new list
  const listElement = document.createElement(isOrdered ? 'ol' : 'ul');
  
  // Get parent of first item to insert the list
  const parent = items[0].parentElement;
  if (!parent) return;
  
  // Insert the list before the first item
  parent.insertBefore(listElement, items[0]);
  
  // Process each item
  items.forEach(item => {
    const content = item.textContent || '';
    
    // Create a new list item
    const li = document.createElement('li');
    
    // Clean the content (remove bullets/numbers)
    const cleanContent = content.replace(/^[•\-\*\u2022\u25E6\u25AA\d+[.)]\s]+/, '').trim();
    li.textContent = cleanContent;
    
    // Add to the list
    listElement.appendChild(li);
    
    // Remove original element
    if (item.parentElement) {
      item.parentElement.removeChild(item);
    }
  });
};
