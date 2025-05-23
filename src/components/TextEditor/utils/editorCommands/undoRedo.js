
import { executeCommand } from './executeCommand';

/**
 * Handles undo operation
 */
export const handleUndo = (handleChange) => {
  executeCommand('undo', null, handleChange);
};

/**
 * Handles redo operation
 */
export const handleRedo = (handleChange) => {
  executeCommand('redo', null, handleChange);
};
