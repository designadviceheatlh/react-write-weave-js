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

  // Detect content source (PDF, Website, Word, etc.)
  const detectContentSource = useCallback((html: string): string => {
    // Check for PDF specific patterns
    if (html.includes('data-pdf-')) return 'pdf';
    
    // Check for common Word patterns
    if (
      html.includes('mso-') || 
      html.includes('word-wrap') || 
      html.includes('WordDocument')
    ) return 'word';
    
    // Check for Google Docs patterns
    if (
      html.includes('docs-') || 
      html.includes('kix-') || 
      html.includes('google-docs')
    ) return 'google-docs';
    
    // If unknown, default to website
    return 'web';
  }, []);

  // Convert plain text to structured HTML
  const processPlainText = useCallback((text: string): string => {
    // Process line breaks to create paragraphs
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    
    // Detect if this might be a list
    const isListItem = (line: string): boolean => {
      return /^[\s]*[-•*][\s]+/.test(line) || // Bullet list
             /^[\s]*\d+[.)]\s+/.test(line);   // Numbered list
    };
    
    // Detect heading patterns
    const isHeading = (line: string, surroundingLines: string[]): { isHeading: boolean, level: number } => {
      const lineIndex = surroundingLines.indexOf(line);
      
      // Check for shorter surrounding lines
      if (line.length > 10 && 
          lineIndex > 0 && 
          surroundingLines[lineIndex-1].trim().length === 0 && 
          (lineIndex === surroundingLines.length-1 || surroundingLines[lineIndex+1].trim().length === 0)) {
        return { isHeading: true, level: line.length > 20 ? 3 : 2 };
      }
      
      // Check for ALL CAPS patterns which are often headings
      if (line.toUpperCase() === line && line.length > 3 && line.match(/[A-Z]/)) {
        return { isHeading: true, level: line.length > 20 ? 2 : 1 };
      }
      
      return { isHeading: false, level: 0 };
    };
    
    let inList = false;
    let listItems: string[] = [];
    let listType = '';
    let html = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const { isHeading: isHead, level } = isHeading(line, lines);
      const isItem = isListItem(line);
      
      if (isHead) {
        // End any open list
        if (inList) {
          html += `<${listType}>${listItems.join('')}</${listType}>`;
          listItems = [];
          inList = false;
        }
        
        // Add heading
        html += `<h${level}>${line.trim().replace(/^#+\s+/, '')}</h${level}>`;
      } else if (isItem) {
        // Detect list type
        const newListType = /^[\s]*\d+/.test(line) ? 'ol' : 'ul';
        
        // If we're changing list types, end the current list
        if (inList && listType !== newListType) {
          html += `<${listType}>${listItems.join('')}</${listType}>`;
          listItems = [];
        }
        
        inList = true;
        listType = newListType;
        
        // Format the list item
        const cleanItem = line
          .replace(/^[\s]*[-•*][\s]+/, '')
          .replace(/^[\s]*\d+[.)]\s+/, '');
        listItems.push(`<li>${cleanItem}</li>`);
      } else {
        // End any open list
        if (inList) {
          html += `<${listType}>${listItems.join('')}</${listType}>`;
          listItems = [];
          inList = false;
        }
        
        // Regular paragraph
        html += `<p>${line.trim()}</p>`;
      }
    }
    
    // Close any open lists
    if (inList) {
      html += `<${listType}>${listItems.join('')}</${listType}>`;
    }
    
    return html;
  }, []);

  // Enhanced function to clean pasted HTML content
  const cleanPastedHTML = useCallback((html: string): string => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Detect content source
    const contentSource = detectContentSource(html);
    
    // Remove all style attributes and classes
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
      // For specific content sources, we might want to preserve some attributes
      if (contentSource !== 'pdf') {
        el.removeAttribute('style');
      }
      el.removeAttribute('class');
      
      // Keep only attributes we want
      const attributesToKeep = ['src', 'href', 'alt', 'colspan', 'rowspan'];
      const attributes = Array.from(el.attributes);
      attributes.forEach(attr => {
        if (!attributesToKeep.includes(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
      
      // Mark the element with data source for specific CSS treatment
      el.setAttribute('data-source', contentSource);
    });
    
    // Handle tables better
    const processTables = () => {
      const tables = tempDiv.querySelectorAll('table');
      tables.forEach(table => {
        // Ensure table has appropriate structure
        if (!table.querySelector('tbody') && table.querySelector('tr')) {
          const tbody = document.createElement('tbody');
          const rows = Array.from(table.querySelectorAll('tr'));
          rows.forEach(row => tbody.appendChild(row));
          table.appendChild(tbody);
        }
      });
    };
    
    processTables();
    
    // Handle line breaks in PDF content
    if (contentSource === 'pdf') {
      // PDFs often have many <br> elements, convert sequences of them to paragraphs
      const processBreaks = (element: Element) => {
        const html = element.innerHTML;
        const processed = html.replace(/(<br\s*\/?>){2,}/gi, '</p><p>');
        element.innerHTML = processed;
      };
      
      // Process breaks in each paragraph
      tempDiv.querySelectorAll('p').forEach(processBreaks);
    }
    
    // Convert divs to paragraphs if they're not headings or lists
    const divs = tempDiv.querySelectorAll('div');
    divs.forEach(div => {
      // Skip if this div contains headings or lists
      if (div.querySelector('h1, h2, h3, h4, h5, h6, ul, ol')) return;
      
      const p = document.createElement('p');
      p.innerHTML = div.innerHTML;
      p.setAttribute('data-source', div.getAttribute('data-source') || contentSource);
      div.parentNode?.replaceChild(p, div);
    });
    
    // Apply formatting based on text styles for web content
    if (contentSource === 'web' || contentSource === 'word') {
      // Function to convert elements based on font properties
      const applyFormatting = () => {
        const spans = tempDiv.querySelectorAll('span, font');
        spans.forEach(el => {
          // Get inline styles or attributes
          const style = window.getComputedStyle(el);
          const fontSize = parseInt(el.style.fontSize || '0');
          const fontWeight = el.style.fontWeight || '';
          const isStrong = 
            fontWeight === 'bold' || 
            parseInt(fontWeight) >= 600 || 
            el.style.fontFamily?.toLowerCase().includes('bold') ||
            el.innerHTML.trim().toUpperCase() === el.innerHTML.trim();
          
          if (isStrong) {
            // Create a <strong> element
            const strong = document.createElement('strong');
            strong.innerHTML = el.innerHTML;
            el.parentNode?.replaceChild(strong, el);
          }
          
          // Convert large text to headings
          if (fontSize >= 20 || el.style.fontSize?.includes('xx-large') || el.style.fontSize?.includes('x-large')) {
            const h1 = document.createElement('h1');
            h1.innerHTML = el.innerHTML;
            el.parentNode?.replaceChild(h1, el);
          } else if (fontSize >= 16 || el.style.fontSize?.includes('large')) {
            const h2 = document.createElement('h2');
            h2.innerHTML = el.innerHTML;
            el.parentNode?.replaceChild(h2, el);
          }
        });
      };
      
      applyFormatting();
    }
    
    // Unified paragraph handling
    const normalizeParaElements = () => {
      // Convert elements that should be paragraphs
      ['div', 'section', 'article', 'span'].forEach(tag => {
        const elements = tempDiv.querySelectorAll(tag);
        elements.forEach(el => {
          // If it contains block elements, don't convert
          if (el.querySelector('h1,h2,h3,h4,h5,h6,p,ul,ol,table')) return;
          
          // If it's a direct child of a block element and doesn't have other inline siblings, don't convert
          if (['TD', 'TH', 'LI'].includes(el.parentElement?.tagName || '') && 
              el.parentElement?.childNodes.length === 1) return;
          
          // If it looks like a paragraph (contains significant text)
          if ((el.textContent || '').trim().length > 20) {
            const p = document.createElement('p');
            p.innerHTML = el.innerHTML;
            el.parentNode?.replaceChild(p, el);
          }
        });
      });
    };
    
    normalizeParaElements();
    
    // Clean empty paragraphs
    tempDiv.querySelectorAll('p').forEach(p => {
      if (!p.textContent?.trim()) {
        p.parentNode?.removeChild(p);
      }
    });
    
    return tempDiv.innerHTML;
  }, [detectContentSource]);

  // Handle paste event
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Get clipboard data
    const clipboardData = e.clipboardData;
    let html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');
    
    // Process the pasted content based on what's available
    let processedContent = '';
    
    if (html) {
      processedContent = cleanPastedHTML(html);
    } else if (text) {
      // For plain text, try to detect structure and convert to HTML
      processedContent = processPlainText(text);
    }
    
    // Insert the processed content at cursor position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      if (processedContent) {
        const fragment = document.createRange().createContextualFragment(processedContent);
        range.insertNode(fragment);
      } else {
        // Fallback to plain text insertion if processing failed
        document.execCommand('insertText', false, text);
      }
      
      // Move cursor to end of inserted content
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (editorRef.current) {
      // If no selection, append to the end
      if (processedContent) {
        editorRef.current.innerHTML += processedContent;
      } else {
        // Fallback
        editorRef.current.innerHTML += text.replace(/\n/g, '<br>');
      }
    }
    
    // Trigger change handler
    handleChange();
  }, [cleanPastedHTML, processPlainText, handleChange]);

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
