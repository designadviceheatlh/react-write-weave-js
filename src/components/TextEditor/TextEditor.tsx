
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
          data-testid="text-editor"
        />
      </div>
    </div>
  );
};

export default TextEditor;
