import React, { useState, useRef, useCallback, useEffect } from 'react';
import Toolbar from './Toolbar';
import { cn } from '@/lib/utils';

export type TextEditorValue = {
  content: string;
  html: string;
};

interface TextEditorProps {
  initialValue?: string;
  onChange?: (value: TextEditorValue) => void;
  placeholder?: string;
  className?: string;
}

const TextEditor = ({
  initialValue = '',
  onChange,
  placeholder = 'Digite seu texto aqui...',
  className,
}: TextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!initialValue);

  const handleChange = useCallback(() => {
    if (!editorRef.current || !onChange) return;
    
    const content = editorRef.current.textContent || '';
    const html = editorRef.current.innerHTML;
    
    // Check if editor is empty to show/hide placeholder
    setIsEmpty(content === '');
    
    onChange({ content, html });
  }, [onChange]);

  const executeCommand = useCallback((command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    handleChange();
    
    // Ensure the editor keeps focus after command execution
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [handleChange]);

  // Function to clean pasted HTML content
  const cleanPastedHTML = useCallback((html: string): string => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove all style attributes and classes
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
      el.removeAttribute('style');
      el.removeAttribute('class');
      
      // Keep only attributes we want
      const attributesToKeep = ['src', 'href', 'alt'];
      const attributes = Array.from(el.attributes);
      attributes.forEach(attr => {
        if (!attributesToKeep.includes(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });
    
    // Convert divs to paragraphs if they're not headings or lists
    const divs = tempDiv.querySelectorAll('div');
    divs.forEach(div => {
      // Skip if this div contains headings or lists
      if (div.querySelector('h1, h2, h3, h4, h5, h6, ul, ol')) return;
      
      const p = document.createElement('p');
      p.innerHTML = div.innerHTML;
      div.parentNode?.replaceChild(p, div);
    });
    
    // Ensure headings have the right structure
    const ensureHeadingTags = (selector: string, newTag: string) => {
      const elements = tempDiv.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.tagName.toLowerCase() !== newTag) {
          const newEl = document.createElement(newTag);
          newEl.innerHTML = el.innerHTML;
          el.parentNode?.replaceChild(newEl, el);
        }
      });
    };
    
    // Apply the correct HTML tags based on font size/style
    const spans = tempDiv.querySelectorAll('span');
    spans.forEach(span => {
      const fontSize = parseInt(span.style.fontSize || '0');
      const fontWeight = parseInt(span.style.fontWeight || '0');
      
      if (fontSize >= 20 || fontWeight >= 500) {
        const h1 = document.createElement('h1');
        h1.innerHTML = span.innerHTML;
        span.parentNode?.replaceChild(h1, span);
      } else if (fontSize >= 16) {
        const h2 = document.createElement('h2');
        h2.innerHTML = span.innerHTML;
        span.parentNode?.replaceChild(h2, span);
      } else {
        // Keep as span or convert to p if it's a block-level span
      }
    });
    
    return tempDiv.innerHTML;
  }, []);

  // Handle paste event
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Get clipboard data
    const clipboardData = e.clipboardData;
    let html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');
    
    // Use HTML if available, otherwise use plain text
    if (html) {
      html = cleanPastedHTML(html);
      
      // Insert at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const fragment = document.createRange().createContextualFragment(html);
        range.insertNode(fragment);
        
        // Move cursor to end of inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (editorRef.current) {
        // If no selection, append to the end
        editorRef.current.innerHTML += html;
      }
    } else if (text) {
      // Insert plain text with execCommand
      document.execCommand('insertText', false, text);
    }
    
    // Trigger change handler
    handleChange();
  }, [cleanPastedHTML, handleChange]);

  // Initialize with content
  useEffect(() => {
    if (initialValue && editorRef.current) {
      editorRef.current.innerHTML = initialValue;
      setIsEmpty(false);
    }
  }, [initialValue]);

  return (
    <div className={cn("flex flex-col border rounded-md overflow-hidden", className)}>
      <Toolbar executeCommand={executeCommand} />
      
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
          onInput={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPaste={handlePaste}
          data-testid="text-editor"
        />
      </div>
    </div>
  );
};

export default TextEditor;
