
/**
 * This file has been refactored into smaller modules.
 * Import from './pasteHandler.js' instead for simple cleaning.
 */
export const cleanPastedHTML = (html) => {
  // Simple HTML cleaning - remove scripts and dangerous elements
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove script tags and other dangerous elements
  const scripts = tempDiv.querySelectorAll('script, style, meta, link');
  scripts.forEach(el => el.remove());
  
  return tempDiv.innerHTML;
};
