
import { executeCommand } from './executeCommand';

/**
 * Applies bold with font-weight: 600 to selected text
 */
export const handleBold = (handleChange?: () => void): void => {
  // First apply the standard bold command
  executeCommand('bold', null, handleChange);
  
  // Then ensure all <b> and <strong> elements use font-weight: 600
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const strongElements = document.querySelectorAll('b, strong');
    strongElements.forEach(el => {
      if (range.intersectsNode(el)) {
        (el as HTMLElement).style.fontWeight = '600';
      }
    });
  }
};
