
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
 * Process nested list structures
 */
export const processNestedLists = (container: HTMLElement): void => {
  // Look for indentation patterns that suggest nesting
  const listItems = container.querySelectorAll('li');
  
  // Map to store items by their indentation level
  const indentationMap = new Map<number, HTMLElement[]>();
  
  listItems.forEach(item => {
    // Try to determine indentation level from various sources
    const computedStyle = window.getComputedStyle(item);
    const marginLeft = parseInt(computedStyle.marginLeft || '0');
    const paddingLeft = parseInt(computedStyle.paddingLeft || '0');
    
    // Simplified: use margin+padding as indentation indicator
    const indentation = marginLeft + paddingLeft;
    
    // Store in map
    if (!indentationMap.has(indentation)) {
      indentationMap.set(indentation, []);
    }
    const items = indentationMap.get(indentation);
    if (items) {
      items.push(item as HTMLElement);
    }
  });
  
  // Sort indentation levels
  const sortedLevels = Array.from(indentationMap.keys()).sort((a, b) => a - b);
  
  // We only need to process if we have multiple indentation levels
  if (sortedLevels.length > 1) {
    // Process from most indented to least
    for (let i = sortedLevels.length - 1; i > 0; i--) {
      const currentLevel = sortedLevels[i];
      const parentLevel = sortedLevels[i - 1];
      
      // Get items at current level
      const currentItems = indentationMap.get(currentLevel) || [];
      
      currentItems.forEach(item => {
        // Find closest previous item with parent level
        const parentItems = indentationMap.get(parentLevel) || [];
        let closestParent: HTMLElement | null = null;
        
        for (let j = 0; j < parentItems.length; j++) {
          if (parentItems[j].compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING) {
            closestParent = parentItems[j];
          }
        }
        
        if (closestParent) {
          // Check if parent already has a sublist
          let sublist = Array.from(closestParent.children).find(
            child => child.tagName === 'UL' || child.tagName === 'OL'
          ) as HTMLElement | undefined;
          
          if (!sublist) {
            // Create new sublist based on current item's list type
            const parentElement = item.parentElement;
            if (parentElement) { // Type guard for parentElement
              const listType = parentElement.tagName === 'OL' ? 'ol' : 'ul';
              sublist = document.createElement(listType);
              closestParent.appendChild(sublist);
            }
          }
          
          // Move item to sublist
          if (sublist) {
            sublist.appendChild(item);
          }
        }
      });
    }
  }
};

/**
 * Fix list structure issues
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
