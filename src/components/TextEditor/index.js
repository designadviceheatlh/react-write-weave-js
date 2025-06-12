
import TextEditor from './TextEditor';

// Export principal component
export default TextEditor;

// Export utils that might be useful for consumers
export { handlePaste } from './utils/pasteHandler';
export { cleanPastedHTML } from './utils/htmlCleaning';
