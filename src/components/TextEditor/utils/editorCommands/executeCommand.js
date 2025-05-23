
/**
 * Executes a document command in the content editable area
 */
export const executeCommand = (
  command, 
  value = null,
  handleChange
) => {
  document.execCommand(command, false, value);
  
  if (handleChange) {
    handleChange();
  }
};
