
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Toolbar from './Toolbar';
import ReviewToolbar from './ReviewToolbar';
import EditorContent from './EditorContent';
import { cn } from '../../lib/utils';
import { executeCommand } from './utils/editorCommands';
import { Textarea } from '../ui/textarea';
import { toast } from '../ui/use-toast';
import { Check, Save, Eye, Edit } from 'lucide-react';
import { getAllHighlights } from './utils/highlightUtils';

const TextEditor = ({
  initialValue = '',
  onChange,
  placeholder = 'Digite seu texto aqui...',
  className
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [notes, setNotes] = useState('');
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [originalContent, setOriginalContent] = useState(initialValue);

  // Autosave timer ref
  const saveTimerRef = useRef(null);

  const handleChange = useCallback(() => {
    if (!editorRef.current || !onChange) return;
    const content = editorRef.current.textContent || '';
    const html = editorRef.current.innerHTML;

    // Check if editor is empty to show/hide placeholder
    setIsEmpty(content === '');
    onChange({
      content,
      html
    });

    // Set up autosave timer only if not in review mode
    if (!isReviewMode) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Show saving indicator
      setIsSaving(true);

      // Autosave after 1 second of inactivity
      saveTimerRef.current = setTimeout(() => {
        // Simulate saving to a backend
        setTimeout(() => {
          setIsSaving(false);
          setLastSaved(new Date());
          toast({
            title: "Conteúdo salvo",
            description: "Seu conteúdo foi salvo automaticamente",
            duration: 2000
          });
        }, 700);
      }, 1000);
    }
  }, [onChange, isReviewMode]);

  const handleExecuteCommand = useCallback((command, value = null) => {
    if (isReviewMode) return; // Prevent editing in review mode
    
    executeCommand(command, value, handleChange);

    // Ensure the editor keeps focus after command execution
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [handleChange, isReviewMode]);

  const toggleReviewMode = () => {
    if (!isReviewMode) {
      // Entering review mode - save original content
      setOriginalContent(editorRef.current?.innerHTML || '');
    }
    setIsReviewMode(!isReviewMode);
    
    toast({
      title: isReviewMode ? "Modo de edição ativado" : "Modo de revisão ativado",
      description: isReviewMode 
        ? "Você pode editar o conteúdo novamente" 
        : "Agora você pode grifar textos sem editar o conteúdo",
      duration: 2000
    });
  };

  const handleHighlightChange = useCallback(() => {
    // Update highlight count or any other review mode specific logic
    if (editorRef.current) {
      const highlights = getAllHighlights(editorRef.current);
      console.log(`Total highlights: ${highlights.length}`);
    }
  }, []);

  useEffect(() => {
    // Store a reference to the editor element for commands
    window.setTimeout(() => {
      if (document.querySelector('[data-testid="text-editor"]')) {
        editorRef.current = document.querySelector('[data-testid="text-editor"]');
      }
    }, 0);

    // Clean up autosave timer on unmount
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleNotesChange = e => {
    setNotes(e.target.value);
  };

  return (
    <div className={cn("flex flex-col border rounded-md overflow-hidden relative", className)}>
      {/* Mode toggle button */}
      <div className="flex justify-between items-center p-2 bg-gray-50 border-b">
        <span className="text-sm text-gray-600">
          {isReviewMode ? 'Modo: Revisão' : 'Modo: Edição'}
        </span>
        <button
          onClick={toggleReviewMode}
          className={cn(
            "flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            isReviewMode 
              ? "bg-orange-100 text-orange-800 hover:bg-orange-200" 
              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
          )}
        >
          {isReviewMode ? <Edit size={16} /> : <Eye size={16} />}
          <span>{isReviewMode ? 'Editar' : 'Revisar'}</span>
        </button>
      </div>

      {/* Conditional toolbar */}
      {isReviewMode ? (
        <ReviewToolbar 
          editorRef={editorRef} 
          onHighlightChange={handleHighlightChange}
        />
      ) : (
        <Toolbar executeCommand={handleExecuteCommand} />
      )}
      
      <EditorContent
        initialValue={initialValue}
        placeholder={placeholder}
        onChange={handleChange}
        isEmpty={isEmpty}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        setIsEmpty={setIsEmpty}
        isReviewMode={isReviewMode}
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
      
      {/* Save indicator - hidden in review mode */}
      {!isReviewMode && (
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
      )}
    </div>
  );
};

export default TextEditor;
