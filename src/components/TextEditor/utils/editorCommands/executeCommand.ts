
/**
 * Executes a document command in the content editable area
 */
export const executeCommand = (
  command: string, 
  value: string | null = null,
  handleChange?: () => void
): void => {
  document.execCommand(command, false, value);
  
  if (handleChange) {
    handleChange();
  }
};
