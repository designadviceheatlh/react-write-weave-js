
import TextEditor from './TextEditor';

// Export principal component
export default TextEditor;

// Export utils that might be useful for consumers
export { executeCommand } from './utils/editorCommands/executeCommand';
export { handlePaste } from './utils/pasteHandling/handlePaste';
export { cleanPastedHTML } from './utils/htmlCleaning/cleanPastedHTML';
