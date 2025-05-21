
/**
 * Apply formatting based on element styles and attributes
 */
export const applyFormattingFromStyles = (container: HTMLElement): void => {
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
