
/**
 * Utilities for building HTML lists from detected list items
 */

/**
 * Builds nested list HTML from a list of items
 */
export const buildNestedListHTML = (items) => {
  // Create root list container based on first item's type
  let html = `<${items[0].type}>`;
  
  // Current state
  let currentLevel = 1;
  let listStack = [items[0].type];  // Stack to track open list tags
  
  for (let i = 0; i < items.length; i++) {
    const { content, type, level, style } = items[i];
    
    // Handle level changes
    if (level > currentLevel) {
      // Going deeper - open new nested list
      for (let l = currentLevel; l < level; l++) {
        html += `<${type}>`;
        listStack.push(type);
      }
    } else if (level < currentLevel) {
      // Going back up - close lists
      for (let l = currentLevel; l > level; l--) {
        html += `</${listStack.pop()}>`;
      }
    }
    
    // Add list item with appropriate styling if needed
    if (style && style !== 'p' && style.match(/^h[1-6]$/)) {
      // If we have a heading style, apply it to the list item content
      html += `<li><${style}>${content}</${style}></li>`;
    } else {
      // Regular list item
      html += `<li>${content}</li>`;
    }
    
    // If next item has different type or is not a list, close current list
    if (i === items.length - 1 || 
        items[i+1].level < level) {
      // Close lists up to target level
      const targetLevel = i === items.length - 1 ? 0 : items[i+1].level;
      for (let l = level; l > targetLevel; l--) {
        html += `</${listStack.pop()}>`;
      }
    }
    
    // Update current level
    currentLevel = level;
  }
  
  // Close any remaining open lists
  while (listStack.length > 0) {
    html += `</${listStack.pop()}>`;
  }
  
  return html;
};
