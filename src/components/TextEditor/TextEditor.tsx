import React, { useState, useRef, useCallback, useEffect } from 'react';
import Toolbar from './Toolbar';
import EditorContent from './EditorContent';
import { cn } from '@/lib/utils';
import { executeCommand } from './utils/editorCommands';

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

  const handleExecuteCommand = useCallback((command: string, value: string | null = null) => {
    executeCommand(command, value, handleChange);
    
    // Ensure the editor keeps focus after command execution
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [handleChange]);

  useEffect(() => {
    // Store a reference to the editor element for commands
    window.setTimeout(() => {
      if (document.querySelector('[data-testid="text-editor"]')) {
        editorRef.current = document.querySelector('[data-testid="text-editor"]') as HTMLDivElement;
      }
    }, 0);
  }, []);

  return (
    <div className={cn("flex flex-col border rounded-md overflow-hidden", className)}>
      <Toolbar executeCommand={handleExecuteCommand} />
      
      <EditorContent
        initialValue={initialValue}
        placeholder={placeholder}
        onChange={handleChange}
        isEmpty={isEmpty}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        setIsEmpty={setIsEmpty}
      />
    </div>
  );
};

export default TextEditor;
