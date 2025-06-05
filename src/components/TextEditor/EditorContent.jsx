
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
  setIsEmpty,
  isReviewMode = false
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
    // Prevent editing shortcuts in review mode
    if (isReviewMode) {
      // Allow only selection and navigation keys
      const allowedKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];
      if (!allowedKeys.includes(e.key) && !e.ctrlKey) {
        e.preventDefault();
        return;
      }
    }

    // Ctrl+Z for undo (only in edit mode)
    if (e.ctrlKey && e.key === 'z' && !isReviewMode) {
      e.preventDefault();
      handleUndo(onChange);
    }
    // Ctrl+Y or Ctrl+Shift+Z for redo (only in edit mode)
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z') && !isReviewMode) {
      e.preventDefault();
      handleRedo(onChange);
    }
    
    // Handle Tab key for list indentation (only in edit mode)
    if (e.key === 'Tab' && !isReviewMode) {
      const isListIndented = handleListIndentation(e.shiftKey, onChange);
      if (isListIndented) {
        e.preventDefault(); // Prevent default tab behavior only if we handled a list indentation
      }
    }
  };

  const handleInput = () => {
    if (isReviewMode) return; // Prevent input changes in review mode
    onChange();
    setIsEmpty(editorRef.current?.textContent === '');
  };

  const handlePasteEvent = (e) => {
    if (isReviewMode) {
      e.preventDefault(); // Prevent pasting in review mode
      return;
    }
    handlePaste(e, onChange);
  };

  return (
    <div className={`relative min-h-[150px] ${isReviewMode ? 'bg-orange-50/30' : ''}`}>
      {isEmpty && !isFocused && (
        <div className="absolute top-0 left-0 p-3 text-gray-400 pointer-events-none font-sans">
          {isReviewMode ? 'Selecione texto para grifar...' : placeholder}
        </div>
      )}
      <div
        className={`p-3 min-h-[150px] focus:outline-none prose prose-sm max-w-none w-full font-sans text-[14px] font-normal leading-normal ${
          isReviewMode ? 'cursor-text select-text' : ''
        }`}
        ref={editorRef}
        contentEditable={!isReviewMode}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePasteEvent}
        onKeyDown={handleKeyDown}
        data-testid="text-editor"
        dangerouslySetInnerHTML={{ __html: initialValue }}
        style={{
          userSelect: isReviewMode ? 'text' : 'auto',
          WebkitUserSelect: isReviewMode ? 'text' : 'auto'
        }}
      />
    </div>
  );
};

export default EditorContent;
