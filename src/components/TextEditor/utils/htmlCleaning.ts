import { detectContentSource } from './contentProcessing';

/**
 * Cleans HTML content from paste operations, maintaining semantic structure
 */
export const cleanPastedHTML = (html: string): string => {
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Detect content source
  const contentSource = detectContentSource(html);
  
  // Remove all style attributes and classes
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach(el => {
    // For specific content sources, we might want to preserve some attributes
    if (contentSource !== 'pdf') {
      el.removeAttribute('style');
    }
    el.removeAttribute('class');
    
    // Keep only attributes we want
    const attributesToKeep = ['src', 'href', 'alt', 'colspan', 'rowspan'];
    const attributes = Array.from(el.attributes);
    attributes.forEach(attr => {
      if (!attributesToKeep.includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });
    
    // Mark the element with data source for specific CSS treatment
    el.setAttribute('data-source', contentSource);
  });
  
  // Process lists from various sources
  detectAndFixLists(tempDiv, contentSource);
  
  // Handle tables better
  processTables(tempDiv);
  
  // Handle line breaks in PDF content
  if (contentSource === 'pdf') {
    handlePdfLineBreaks(tempDiv);
  }
  
  // Convert divs to paragraphs and apply formatting
  convertDivsToParagraphs(tempDiv);
  
  // Apply formatting based on text styles for web content
  if (contentSource === 'web' || contentSource === 'word') {
    applyFormattingFromStyles(tempDiv);
  }
  
  // Unified paragraph handling
  normalizeParaElements(tempDiv);
  
  // Clean empty paragraphs
  cleanEmptyParagraphs(tempDiv);
  
  return tempDiv.innerHTML;
};

/**
 * Detects and fixes lists from various sources
 */
const detectAndFixLists = (container: HTMLElement, contentSource: string): void => {
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
 * Converts Microsoft Word list paragraphs to proper HTML lists
 */
const convertMsoListToProperList = (items: NodeListOf<Element>): void => {
  let currentList: HTMLElement | null = null;
  let isOrdered = false;
  let lastLevel = 0;
  
  items.forEach((item, index) => {
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
 * Looks for paragraph sequences that should be lists
 */
const detectAndConvertParagraphsToLists = (container: HTMLElement): void => {
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
 * Converts a sequence of elements to a proper list
 */
const convertElementSequenceToList = (items: Element[], isOrdered: boolean): void => {
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

/**
 * Detects and converts DIV elements that look like lists
 */
const detectAndConvertDivLists = (container: HTMLElement): void => {
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
const processNestedLists = (container: HTMLElement): void => {
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
      items.push(item);
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
            const listType = parentElement && (parentElement.tagName === 'OL' ? 'ol' : 'ul');
            sublist = document.createElement(listType || 'ul');
            closestParent.appendChild(sublist);
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
const fixListStructure = (container: HTMLElement): void => {
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

/**
 * Process tables to ensure proper structure
 */
const processTables = (container: HTMLElement): void => {
  const tables = container.querySelectorAll('table');
  tables.forEach(table => {
    // Ensure table has appropriate structure
    if (!table.querySelector('tbody') && table.querySelector('tr')) {
      const tbody = document.createElement('tbody');
      const rows = Array.from(table.querySelectorAll('tr'));
      rows.forEach(row => tbody.appendChild(row));
      table.appendChild(tbody);
    }
  });
};

/**
 * Handle line breaks in PDF content
 */
const handlePdfLineBreaks = (container: HTMLElement): void => {
  // PDFs often have many <br> elements, convert sequences of them to paragraphs
  const processBreaks = (element: Element) => {
    const html = element.innerHTML;
    const processed = html.replace(/(<br\s*\/?>){2,}/gi, '</p><p>');
    element.innerHTML = processed;
  };
  
  // Process breaks in each paragraph
  container.querySelectorAll('p').forEach(processBreaks);
};

/**
 * Convert divs to paragraphs when appropriate
 */
const convertDivsToParagraphs = (container: HTMLElement): void => {
  const divs = container.querySelectorAll('div');
  const contentSource = container.querySelector('*')?.getAttribute('data-source') || 'web';
  
  divs.forEach(div => {
    // Skip if this div contains headings or lists
    if (div.querySelector('h1, h2, h3, h4, h5, h6, ul, ol')) return;
    
    const p = document.createElement('p');
    p.innerHTML = div.innerHTML;
    p.setAttribute('data-source', div.getAttribute('data-source') || contentSource);
    div.parentNode?.replaceChild(p, div);
  });
};

/**
 * Apply formatting based on element styles and attributes
 */
const applyFormattingFromStyles = (container: HTMLElement): void => {
  // Function to convert elements based on font properties
  const spans = container.querySelectorAll('span, font');
  spans.forEach(el => {
    // Get inline styles or attributes
    const computedStyle = window.getComputedStyle(el as HTMLElement);
    const fontSize = parseInt((el as HTMLElement).style.fontSize || '0');
    const fontWeight = (el as HTMLElement).style.fontWeight || '';
    const isStrong = 
      fontWeight === 'bold' || 
      parseInt(fontWeight) >= 600 || 
      (el as HTMLElement).style.fontFamily?.toLowerCase().includes('bold') ||
      el.innerHTML.trim().toUpperCase() === el.innerHTML.trim();
    
    if (isStrong) {
      // Create a <strong> element
      const strong = document.createElement('strong');
      strong.innerHTML = el.innerHTML;
      el.parentNode?.replaceChild(strong, el);
    }
    
    // Convert large text to headings
    if (fontSize >= 20 || (el as HTMLElement).style.fontSize?.includes('xx-large') || (el as HTMLElement).style.fontSize?.includes('x-large')) {
      const h1 = document.createElement('h1');
      h1.innerHTML = el.innerHTML;
      el.parentNode?.replaceChild(h1, el);
    } else if (fontSize >= 16 || (el as HTMLElement).style.fontSize?.includes('large')) {
      const h2 = document.createElement('h2');
      h2.innerHTML = el.innerHTML;
      el.parentNode?.replaceChild(h2, el);
    }
  });
};

/**
 * Convert sections that should be paragraphs
 */
const normalizeParaElements = (container: HTMLElement): void => {
  // Convert elements that should be paragraphs
  ['div', 'section', 'article', 'span'].forEach(tag => {
    const elements = container.querySelectorAll(tag);
    elements.forEach(el => {
      // If it contains block elements, don't convert
      if (el.querySelector('h1,h2,h3,h4,h5,h6,p,ul,ol,table')) return;
      
      // If it's a direct child of a block element and doesn't have other inline siblings, don't convert
      if (['TD', 'TH', 'LI'].includes(el.parentElement?.tagName || '') && 
          el.parentElement?.childNodes.length === 1) return;
      
      // If it looks like a paragraph (contains significant text)
      if ((el.textContent || '').trim().length > 20) {
        const p = document.createElement('p');
        p.innerHTML = el.innerHTML;
        el.parentNode?.replaceChild(p, el);
      }
    });
  });
};

/**
 * Remove empty paragraphs
 */
const cleanEmptyParagraphs = (container: HTMLElement): void => {
  container.querySelectorAll('p').forEach(p => {
    if (!p.textContent?.trim()) {
      p.parentNode?.removeChild(p);
    }
  });
};
