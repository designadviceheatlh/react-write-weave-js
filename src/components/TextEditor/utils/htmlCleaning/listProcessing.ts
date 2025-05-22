import { convertElementSequenceToList, convertMsoListToProperList } from './listConverters';

/**
 * Detects and fixes lists from various sources
 */
export const detectAndFixLists = (container: HTMLElement, contentSource: string): void => {
  // Word and Office-specific list styles
  if (contentSource === 'word') {
    // Process Word's MsoListParagraph style indicators
    const potentialListItems = container.querySelectorAll('[style*="mso-list"]');
    if (potentialListItems.length > 0) {
      convertMsoListToProperList(potentialListItems);
    }
  }
  
  // Find paragraph sequences that look like lists
  detectAndConvertParagraphsToLists(container);
  
  // Find DIVs with bullets or numbers at the start that should be lists
  detectAndConvertDivLists(container);
  
  // Process nested list structures
  processNestedLists(container);
  
  // Fix list structure (sometimes li elements are missing)
  fixListStructure(container);
};

/**
 * Looks for paragraph sequences that should be lists
 */
export const detectAndConvertParagraphsToLists = (container: HTMLElement): void => {
  // Get all paragraphs
  const paragraphs = Array.from(container.querySelectorAll('p'));
  let listItems: Element[] = [];
  let isOrdered = false;
  
  // Go through paragraphs looking for sequences that should be lists
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const content = para.textContent || '';
    const trimmed = content.trim();
    
    // Check if this looks like a bullet or numbered list item
    const isBullet = /^[•\-\*\u2022\u25E6\u25AA]/.test(trimmed);
    const isNumber = /^\d+[.)]/.test(trimmed);
    
    if (isBullet || isNumber) {
      // If we're starting a new list, set type
      if (listItems.length === 0) {
        isOrdered = isNumber;
      }
      
      listItems.push(para);
    } else if (listItems.length > 0) {
      // We've finished collecting a list, convert it
      convertElementSequenceToList(listItems, isOrdered);
      listItems = [];
    }
  }
  
  // Convert any remaining list items
  if (listItems.length > 0) {
    convertElementSequenceToList(listItems, isOrdered);
  }
};

/**
 * Detects and converts DIV elements that look like lists
 */
export const detectAndConvertDivLists = (container: HTMLElement): void => {
  // Implementation similar to detectAndConvertParagraphsToLists
  const divs = Array.from(container.querySelectorAll('div'));
  let listItems: Element[] = [];
  let isOrdered = false;
  
  for (let i = 0; i < divs.length; i++) {
    const div = divs[i];
    const content = div.textContent || '';
    const trimmed = content.trim();
    
    // Is this a list item?
    const isBullet = /^[•\-\*\u2022\u25E6\u25AA]/.test(trimmed);
    const isNumber = /^\d+[.)]/.test(trimmed);
    
    if (isBullet || isNumber) {
      if (listItems.length === 0) {
        isOrdered = isNumber;
      }
      listItems.push(div);
    } else if (listItems.length > 0) {
      convertElementSequenceToList(listItems, isOrdered);
      listItems = [];
    }
  }
  
  if (listItems.length > 0) {
    convertElementSequenceToList(listItems, isOrdered);
  }
};

/**
 * Process nested list structures with improved hierarchy detection
 * between numbered lists and bullet points
 */
export const processNestedLists = (container: HTMLElement): void => {
  // Get all list items and immediate parents to understand hierarchy
  const listContainers = container.querySelectorAll('ul, ol');
  const listItems = Array.from(container.querySelectorAll('li'));
  
  // First pass: Analyze and mark list item levels based on indentation and context
  const itemLevelMap = new Map<HTMLElement, number>();
  const itemTypeMap = new Map<HTMLElement, string>();
  
  // Determine the nesting level and type for each list item
  listItems.forEach(item => {
    const parent = item.parentElement;
    if (!parent) return;
    
    // Store the list type (ul or ol) for each item
    itemTypeMap.set(item as HTMLElement, parent.tagName.toLowerCase());
    
    // Calculate level based on indentation and/or position in document
    const computedStyle = window.getComputedStyle(item);
    const marginLeft = parseInt(computedStyle.marginLeft || '0');
    const paddingLeft = parseInt(computedStyle.paddingLeft || '0');
    const indentation = marginLeft + paddingLeft;
    
    // Check for explicit level markers in text (e.g., 1.1, 2.3, etc.)
    const content = item.textContent || '';
    const levelFromContent = detectLevelFromContent(content);
    
    // Use the higher of the calculated indentation level or content-implied level
    const level = Math.max(
      Math.floor(indentation / 20) + 1, // Estimate from CSS
      levelFromContent
    );
    
    itemLevelMap.set(item as HTMLElement, level);
  });
  
  // Second pass: Reorganize nested lists based on detected hierarchy
  processListHierarchy(listItems, itemLevelMap, itemTypeMap);
  
  // Find misplaced lists - lists that should be in an li but aren't
  container.querySelectorAll('ul > ul, ul > ol, ol > ul, ol > ol').forEach(list => {
    const parent = list.parentElement;
    if (parent && (parent.tagName === 'UL' || parent.tagName === 'OL')) {
      // Create a list item to contain this list
      const li = document.createElement('li');
      
      // Move before the nested list
      parent.insertBefore(li, list);
      
      // Move the list inside the li
      li.appendChild(list);
    }
  });
  
  // Enhance mixed list detection with bidirectional nesting support
  correlateNumberedAndBulletLists(container);
};

/**
 * Detects level from list item content (e.g., 1.1, 1.1.2)
 */
function detectLevelFromContent(content: string): number {
  // Check for numbered patterns like 1.2.3 or 1.1
  const hierarchicalNumberMatch = content.match(/^(\d+\.)+\d+/);
  if (hierarchicalNumberMatch) {
    // Count the number of dots plus 1 for the level
    const dots = (hierarchicalNumberMatch[0].match(/\./g) || []).length;
    return dots + 1;
  }
  
  return 1; // Default level
}

/**
 * Process list items based on detected hierarchy levels
 */
function processListHierarchy(
  listItems: Element[],
  itemLevelMap: Map<HTMLElement, number>,
  itemTypeMap: Map<HTMLElement, string>
): void {
  // Sort items by their position in the document for correct processing order
  const sortedItems = [...listItems].sort((a, b) => {
    const positionComparison = a.compareDocumentPosition(b);
    return positionComparison & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
  
  // Process items by level
  for (let level = 5; level > 1; level--) {
    // Find items at this level
    const itemsAtLevel = sortedItems.filter(item => 
      itemLevelMap.get(item as HTMLElement) === level
    );
    
    for (const item of itemsAtLevel) {
      // Find the closest previous item with a lower level to be the parent
      let parent: Element | null = null;
      let closestIndex = -1;
      
      for (let i = sortedItems.indexOf(item) - 1; i >= 0; i--) {
        const potentialParent = sortedItems[i];
        const parentLevel = itemLevelMap.get(potentialParent as HTMLElement) || 0;
        
        if (parentLevel < level && parentLevel > 0) {
          parent = potentialParent;
          closestIndex = i;
          break;
        }
      }
      
      if (parent) {
        // Get the item's list type
        const itemType = itemTypeMap.get(item as HTMLElement) || 'ul';
        
        // Find or create a nested list in the parent
        // Allow mixing of list types - use the item's list type, not necessarily the parent's
        let nestedList = Array.from(parent.children).find(
          child => child.tagName.toLowerCase() === itemType
        ) as HTMLElement | undefined;
        
        if (!nestedList) {
          // Create a new list with the same type as the item's parent list
          nestedList = document.createElement(itemType);
          parent.appendChild(nestedList);
        }
        
        // Move this item to the nested list
        if (nestedList && item.parentElement !== nestedList) {
          nestedList.appendChild(item);
        }
      }
    }
  }
}

/**
 * Correlate numbered lists with bullet point sublists for proper nesting
 * Enhanced for bidirectional nesting support
 */
function correlateNumberedAndBulletLists(container: HTMLElement): void {
  // Step 1: Find all top level list items
  const topLevelItems = Array.from(container.querySelectorAll('body > ul > li, body > ol > li, #root > ul > li, #root > ol > li, div > ul > li, div > ol > li'))
    .filter(item => !(item.parentElement?.parentElement instanceof HTMLLIElement));
  
  // Step 2: Check if immediate siblings have different list types
  const processedLists = new Set();
  
  container.querySelectorAll('ul + ol, ol + ul').forEach(list => {
    if (processedLists.has(list)) return;
    
    const previousSibling = list.previousElementSibling;
    if (previousSibling && (previousSibling.tagName === 'UL' || previousSibling.tagName === 'OL')) {
      // These are sibling lists of different types - they might need nesting
      const prevItems = previousSibling.querySelectorAll('li');
      if (prevItems.length > 0) {
        const lastItem = prevItems[prevItems.length - 1];
        
        // Move the list as a child of the last item in the previous list
        lastItem.appendChild(list);
        
        processedLists.add(list);
      }
    }
  });
  
  // Step 3: Look for indentation patterns that might indicate nesting between list types
  const allLists = container.querySelectorAll('ul, ol');
  allLists.forEach(list => {
    const computedStyle = window.getComputedStyle(list);
    const marginLeft = parseInt(computedStyle.marginLeft || '0');
    
    if (marginLeft > 0) {
      // This might be a nested list that wasn't properly structured
      const previousElement = getPreviousElementInFlow(list);
      
      if (previousElement instanceof HTMLLIElement) {
        // Move this list into the previous list item
        previousElement.appendChild(list);
      }
    }
  });
  
  // Step 4: Ensure proper mixing of list types in nested structures
  // Find list items with no content but that contain a list of a different type
  container.querySelectorAll('li').forEach(item => {
    if (!item.textContent?.trim()) return;
    
    const childLists = Array.from(item.children).filter(
      child => child.tagName === 'UL' || child.tagName === 'OL'
    );
    
    if (childLists.length > 1) {
      // If we have multiple child lists, we need to reorganize them
      const firstListType = childLists[0].tagName.toLowerCase();
      
      // Group subsequent lists under the last item of the previous list when types differ
      for (let i = 1; i < childLists.length; i++) {
        const currentList = childLists[i];
        const currentType = currentList.tagName.toLowerCase();
        
        if (currentType !== firstListType) {
          const previousList = childLists[i-1];
          const lastItem = previousList.lastElementChild;
          
          if (lastItem) {
            // Move the current list as a child of the last item in the previous list
            lastItem.appendChild(currentList);
          }
        }
      }
    }
  });
}

/**
 * Get the previous element in the document flow, considering the DOM structure
 */
function getPreviousElementInFlow(element: Element): Element | null {
  if (element.previousElementSibling) {
    return element.previousElementSibling;
  } else if (element.parentElement) {
    return element.parentElement;
  }
  return null;
}

/**
 * Fix list structure issues - enhanced for mixed list types
 */
export const fixListStructure = (container: HTMLElement): void => {
  // Find naked list items (not in ul/ol)
  const allElements = container.querySelectorAll('*');
  
  allElements.forEach(el => {
    // Check if the element has text content that looks like a list item
    const content = el.textContent || '';
    const trimmed = content.trim();
    
    if (el.tagName !== 'LI' && el.tagName !== 'UL' && el.tagName !== 'OL') {
      const isBullet = /^[•\-\*\u2022\u25E6\u25AA]\s+/.test(trimmed);
      const isNumber = /^\d+[.)]\s+/.test(trimmed);
      
      if ((isBullet || isNumber) && el.parentElement) {
        // Create proper list element
        const listType = isNumber ? 'ol' : 'ul';
        const list = document.createElement(listType);
        
        // Create list item
        const li = document.createElement('li');
        
        // Clean content
        const cleanContent = trimmed.replace(/^[•\-\*\u2022\u25E6\u25AA\d+[.)]\s+/, '');
        li.textContent = cleanContent;
        
        // Add to list
        list.appendChild(li);
        
        // Replace original element
        el.parentElement.replaceChild(list, el);
      }
    }
  });
  
  // Fix nested lists of different types
  fixNestedListTypes(container);
  
  // Fix nested ul/ol that are not inside li elements
  container.querySelectorAll('ul > ul, ul > ol, ol > ul, ol > ol').forEach(list => {
    const parent = list.parentElement;
    if (parent && (parent.tagName === 'UL' || parent.tagName === 'OL')) {
      // Create a list item to contain this list
      const li = document.createElement('li');
      
      // Move before the nested list
      parent.insertBefore(li, list);
      
      // Move the list inside the li
      li.appendChild(list);
    }
  });
};

/**
 * Fix incorrect nesting of different list types
 */
function fixNestedListTypes(container: HTMLElement): void {
  // Find list items with multiple direct child lists
  container.querySelectorAll('li').forEach(item => {
    const childLists = Array.from(item.children).filter(
      child => child.tagName === 'UL' || child.tagName === 'OL'
    );
    
    if (childLists.length > 1) {
      // Keep the first list as is
      const firstList = childLists[0];
      
      // For each additional list, either merge with first list or nest properly
      for (let i = 1; i < childLists.length; i++) {
        const currentList = childLists[i];
        
        // If same type, merge the lists
        if (currentList.tagName === firstList.tagName) {
          // Move all children of the current list to the first list
          while (currentList.firstChild) {
            firstList.appendChild(currentList.firstChild);
          }
          // Remove the empty list
          if (currentList.parentNode) {
            currentList.parentNode.removeChild(currentList);
          }
        } else {
          // Different list types - ensure proper nesting
          // If the first list has items, attach to its last item
          if (firstList.children.length > 0) {
            const lastItem = firstList.lastElementChild;
            if (lastItem) {
              lastItem.appendChild(currentList);
            }
          } else {
            // If the first list is empty, just keep both lists
            continue;
          }
        }
      }
    }
  });
}
