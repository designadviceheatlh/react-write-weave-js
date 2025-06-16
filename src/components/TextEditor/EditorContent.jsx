
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { sanitizeHTML } from './utils/htmlSanitizer';

const EditorContent = forwardRef(({ 
  content = '', 
  onChange, 
  onSelectionChange, 
  placeholder = 'Digite seu texto aqui...',
  className = '',
  readOnly = false,
  initialValue = '',
  isEmpty = false,
  isFocused = false,
  setIsFocused = () => {},
  setIsEmpty = () => {},
  isReviewMode = false
}, ref) => {
  const contentRef = useRef(null);

  // Expose the content element to parent components
  useImperativeHandle(ref, () => contentRef.current, []);

  // Use initialValue if provided, otherwise use content
  const displayContent = initialValue || content;
  const sanitizedContent = sanitizeHTML(displayContent);

  useEffect(() => {
    if (contentRef.current && !readOnly) {
      // Set initial content
      if (sanitizedContent && contentRef.current.innerHTML !== sanitizedContent) {
        contentRef.current.innerHTML = sanitizedContent;
      }

      // Set up event listeners for content changes
      const handleInput = () => {
        if (onChange) {
          const newContent = contentRef.current.innerHTML;
          onChange(sanitizeHTML(newContent));
        }
        
        // Update empty state
        const textContent = contentRef.current.textContent || '';
        setIsEmpty(textContent.trim() === '');
      };

      const handleSelectionChange = () => {
        if (onSelectionChange && document.activeElement === contentRef.current) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            onSelectionChange(selection.getRangeAt(0));
          }
        }
      };

      const handleFocus = () => {
        setIsFocused(true);
      };

      const handleBlur = () => {
        setIsFocused(false);
      };

      const element = contentRef.current;
      element.addEventListener('input', handleInput);
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);
      document.addEventListener('selectionchange', handleSelectionChange);

      return () => {
        element.removeEventListener('input', handleInput);
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('blur', handleBlur);
        document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }
  }, [onChange, onSelectionChange, readOnly, sanitizedContent, setIsFocused, setIsEmpty]);

  // Safely render HTML content
  if (readOnly) {
    return (
      <div
        className={`editor-display ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  }

  return (
    <div className="relative">
      <div
        ref={contentRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning={true}
        className={`editor-content ${className} focus:outline-none`}
        data-placeholder={placeholder}
        data-review-mode={isReviewMode}
        style={{
          minHeight: '200px',
          padding: '12px',
          border: '1px solid #e5e5e5',
          borderRadius: '4px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
      />
      {isEmpty && !isFocused && (
        <div 
          className="absolute top-3 left-3 text-gray-400 pointer-events-none"
          style={{ fontSize: '14px' }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
});

EditorContent.displayName = 'EditorContent';

export default EditorContent;
