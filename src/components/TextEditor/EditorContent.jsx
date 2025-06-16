
import React, { useRef, useEffect } from 'react';
import { sanitizeHTML } from './utils/htmlSanitizer';

const EditorContent = ({ 
  content = '', 
  onChange, 
  onSelectionChange, 
  placeholder = 'Digite seu texto aqui...',
  className = '',
  readOnly = false 
}) => {
  const contentRef = useRef(null);

  // Sanitize content before rendering
  const sanitizedContent = sanitizeHTML(content);

  useEffect(() => {
    if (contentRef.current && !readOnly) {
      // Set up event listeners for content changes
      const handleInput = () => {
        if (onChange) {
          const newContent = contentRef.current.innerHTML;
          onChange(sanitizeHTML(newContent));
        }
      };

      const handleSelectionChange = () => {
        if (onSelectionChange && document.activeElement === contentRef.current) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            onSelectionChange(selection.getRangeAt(0));
          }
        }
      };

      const element = contentRef.current;
      element.addEventListener('input', handleInput);
      document.addEventListener('selectionchange', handleSelectionChange);

      return () => {
        element.removeEventListener('input', handleInput);
        document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }
  }, [onChange, onSelectionChange, readOnly]);

  // Safely render HTML content
  const renderContent = () => {
    if (readOnly) {
      return (
        <div
          className={`editor-display ${className}`}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      );
    }

    return (
      <div
        ref={contentRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning={true}
        className={`editor-content ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        data-placeholder={placeholder}
        style={{
          minHeight: '200px',
          padding: '12px',
          border: '1px solid #e5e5e5',
          borderRadius: '4px',
          outline: 'none',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
      />
    );
  };

  return renderContent();
};

export default EditorContent;
