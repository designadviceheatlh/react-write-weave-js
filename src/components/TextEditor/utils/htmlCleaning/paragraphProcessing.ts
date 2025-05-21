
/**
 * Convert sections that should be paragraphs
 */
export const normalizeParaElements = (container: HTMLElement): void => {
  // Convert elements that should be paragraphs
  ['div', 'section', 'article', 'span'].forEach(tag => {
    const elements = container.querySelectorAll(tag);
    elements.forEach(el => {
      // If it contains block elements, don't convert
      if (el.querySelector('h1,h2,h3,h4,h5,h6,p,ul,ol,table')) return;
      
      // If it's a direct child of a block element and doesn't have other inline siblings, don't convert
      const parentElement = el.parentElement;
      if (parentElement && ['TD', 'TH', 'LI'].includes(parentElement.tagName) && 
          parentElement.childNodes.length === 1) return;
      
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
export const cleanEmptyParagraphs = (container: HTMLElement): void => {
  container.querySelectorAll('p').forEach(p => {
    if (!p.textContent?.trim()) {
      p.parentNode?.removeChild(p);
    }
  });
};
