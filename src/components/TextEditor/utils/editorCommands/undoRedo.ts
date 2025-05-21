
import { executeCommand } from './executeCommand';

/**
 * Handles undo operation
 */
export const handleUndo = (handleChange?: () => void): void => {
  executeCommand('undo', null, handleChange);
};

/**
 * Handles redo operation
 */
export const handleRedo = (handleChange?: () => void): void => {
  executeCommand('redo', null, handleChange);
};
