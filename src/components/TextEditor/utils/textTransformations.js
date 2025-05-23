
/**
 * Text transformation utility functions
 */

/**
 * Transforms selected text to uppercase
 */
export const transformToUppercase = (text) => {
  return text.toUpperCase();
};

/**
 * Transforms selected text to lowercase
 */
export const transformToLowercase = (text) => {
  return text.toLowerCase();
};

/**
 * Capitalizes each word in the selected text
 */
export const capitalizeWords = (text) => {
  return text.replace(/\b\w+/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
};

/**
 * Capitalizes only the first letter of a sentence
 */
export const capitalizeSentence = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Applies text transformation to selected text in the editor
 */
export const applyTextTransformation = (
  transformFunction,
  handleChange
) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  // Get the selected text
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  
  if (!selectedText) return;
  
  // Apply the transformation
  const transformedText = transformFunction(selectedText);
  
  // Replace the selected text with the transformed text
  document.execCommand('insertText', false, transformedText);
  
  if (handleChange) {
    handleChange();
  }
};
