
import TextEditor from './TextEditor';

// Export principal component
export default TextEditor;

// Export types
export type { TextEditorValue } from './TextEditor';

// Export utils that might be useful for consumers
export { executeCommand } from './utils/editorCommands/executeCommand';
export { handlePaste } from './utils/pasteHandling/handlePaste';
export { cleanPastedHTML } from './utils/htmlCleaning/cleanPastedHTML';

// All done in one file to maintain backwards compatibility
