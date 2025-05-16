import React, { useState, useRef, useCallback } from 'react';
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

  const handleChange = useCallback(() => {
    if (!editorRef.current || !onChange) return;
    
    const content = editorRef.current.textContent || '';
    const html = editorRef.current.innerHTML;
    
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

  return (
    <div className={cn("flex flex-col border rounded-md overflow-hidden", className)}>
      <Toolbar executeCommand={executeCommand} />
      
      <div
        className="p-3 min-h-[150px] focus:outline-none prose prose-sm max-w-none"
        ref={editorRef}
        contentEditable
        dangerouslySetInnerHTML={{ __html: initialValue }}
        onInput={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        data-placeholder={placeholder}
        style={{
          position: 'relative',
        }}
      />
    </div>
  );
};

export default TextEditor;
