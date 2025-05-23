
import React, { useRef, useEffect } from 'react';
import { handlePaste } from './utils/pasteHandling';
import { handleUndo, handleRedo } from './utils/editorCommands';
import { handleListIndentation } from './utils/editorCommands/insertCommands';

const EditorContent = ({
  initialValue,
  placeholder,
  onChange,
  isEmpty,
  isFocused,
  setIsFocused,
  setIsEmpty
}) => {
  const editorRef = useRef(null);

  // Preserve heading styles when creating lists
  useEffect(() => {
    if (editorRef.current) {
      // Observe mutations to preserve styles when lists are created
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            // Check for new list elements
            mutation.addedNodes.forEach(node => {
              if (node instanceof HTMLElement) {
                if (node.nodeName === 'UL' || node.nodeName === 'OL') {
                  // Get the parent element style
                  const parentStyle = node.parentElement?.nodeName;
                  if (parentStyle && ['H1', 'H2', 'H3'].includes(parentStyle)) {
                    // Ensure list items inside headings maintain the heading style
                    node.querySelectorAll('li').forEach(li => {
                      li.style.fontWeight = window.getComputedStyle(node.parentElement).fontWeight;
                      li.style.fontSize = window.getComputedStyle(node.parentElement).fontSize;
                    });
                  }
                }
              }
            });
          }
        });
      });
      
      // Start observing
      observer.observe(editorRef.current, { 
        childList: true, 
        subtree: true 
      });
      
      return () => observer.disconnect();
    }
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Ctrl+Z for undo
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      handleUndo(onChange);
    }
    // Ctrl+Y or Ctrl+Shift+Z for redo
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      handleRedo(onChange);
    }
    
    // Handle Tab key for list indentation
    if (e.key === 'Tab') {
      const isListIndented = handleListIndentation(e.shiftKey, onChange);
      if (isListIndented) {
        e.preventDefault(); // Prevent default tab behavior only if we handled a list indentation
      }
    }
  };

  return (
    <div className="relative min-h-[150px]">
      {isEmpty && !isFocused && (
        <div className="absolute top-0 left-0 p-3 text-gray-400 pointer-events-none font-sans">
          {placeholder}
        </div>
      )}
      <div
        className="p-3 min-h-[150px] focus:outline-none prose prose-sm max-w-none w-full font-sans text-[14px] font-normal leading-normal"
        ref={editorRef}
        contentEditable
        onInput={() => {
          onChange();
          setIsEmpty(editorRef.current?.textContent === '');
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={(e) => handlePaste(e, onChange)}
        onKeyDown={handleKeyDown}
        data-testid="text-editor"
        dangerouslySetInnerHTML={{ __html: initialValue }}
      />
    </div>
  );
};

export default EditorContent;
