
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Toolbar from './Toolbar';
import EditorContent from './EditorContent';
import { cn } from '@/lib/utils';
import { executeCommand } from './utils/editorCommands';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Check, Save } from 'lucide-react';

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
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  
  // Autosave timer ref
  const saveTimerRef = useRef<number | null>(null);

  const handleChange = useCallback(() => {
    if (!editorRef.current || !onChange) return;
    
    const content = editorRef.current.textContent || '';
    const html = editorRef.current.innerHTML;
    
    // Check if editor is empty to show/hide placeholder
    setIsEmpty(content === '');
    
    onChange({ content, html });
    
    // Set up autosave timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    // Show saving indicator
    setIsSaving(true);
    
    // Autosave after 1 second of inactivity
    saveTimerRef.current = window.setTimeout(() => {
      // Simulate saving to a backend
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
        toast({
          title: "Conteúdo salvo",
          description: "Seu conteúdo foi salvo automaticamente",
          duration: 2000,
        });
      }, 700); // Simulate a short delay for the save operation
    }, 1000);
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
    
    // Clean up autosave timer on unmount
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  return (
    <div className={cn("flex flex-col border rounded-md overflow-hidden relative", className)}>
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
      
      <div className="mt-4">
        <Textarea 
          placeholder="Anotações adicionais..." 
          className="w-full resize-none" 
          rows={3}
          value={notes}
          onChange={handleNotesChange}
          onBlur={handleChange}
        />
      </div>
      
      {/* Save indicator */}
      <div className="absolute bottom-4 right-4 flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm border text-sm">
        {isSaving ? (
          <>
            <Save size={16} className="text-blue-600 animate-pulse mr-2" />
            <span>Salvando...</span>
          </>
        ) : lastSaved ? (
          <>
            <Check size={16} className="text-green-600 mr-2" />
            <span>Salvo às {lastSaved.toLocaleTimeString()}</span>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TextEditor;

