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
