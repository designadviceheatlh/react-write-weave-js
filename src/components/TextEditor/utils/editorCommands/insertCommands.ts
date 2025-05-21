
import { executeCommand } from './executeCommand';

/**
 * Insere um divisor horizontal no editor
 */
export const handleInsertDivider = (handleChange?: () => void): void => {
  // Criar elemento divisor
  const divider = document.createElement('hr');
  divider.className = 'my-4 border-t border-gray-300';
  
  // Inserir o divisor na posição atual do cursor
  document.execCommand('insertHTML', false, divider.outerHTML);
  
  if (handleChange) {
    handleChange();
  }
};
