import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '../../../hooks/use-toast';
import { executeCommand } from '../utils/editorCommands';
import { sanitizeHTML, validateContentLength } from '../utils/htmlSanitizer';
import { getAllHighlights } from '../utils/highlightUtils';

export const useTextEditorState = (initialValue, onChange) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Sanitize initial value for security
  const sanitizedInitialValue = sanitizeHTML(validateContentLength(initialValue));
  const [isEmpty, setIsEmpty] = useState(!sanitizedInitialValue);
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [originalContent, setOriginalContent] = useState(initialValue);

  // Autosave timer ref
  const saveTimerRef = useRef(null);
  
  const handleChange = useCallback((html) => {
    if (!onChange) return;
    
    // Extract text content for validation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const content = tempDiv.textContent || tempDiv.innerText || '';
    
    // Sanitize HTML content before processing
    const sanitizedHTML = sanitizeHTML(html);
    const validatedContent = validateContentLength(content);
    const validatedHTML = validateContentLength(sanitizedHTML);

    // Check if editor is empty to show/hide placeholder
    setIsEmpty(validatedContent.trim() === '');
    
    onChange({
      content: validatedContent,
      html: validatedHTML
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

    // Validate command parameters for security
    if (typeof command !== 'string') {
      console.warn('Invalid command type:', typeof command);
      return;
    }
    
    // Sanitize value if it's HTML content
    let sanitizedValue = value;
    if (value && typeof value === 'string' && value.includes('<')) {
      sanitizedValue = sanitizeHTML(value);
    }

    executeCommand(command, sanitizedValue, handleChange);

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
      description: isReviewMode ? "Você pode editar o conteúdo novamente" : "Agora você pode grifar textos sem editar o conteúdo",
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
    // Clean up autosave timer on unmount
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return {
    editorRef,
    isFocused,
    setIsFocused,
    isEmpty,
    setIsEmpty,
    isSaving,
    lastSaved,
    isReviewMode,
    originalContent,
    sanitizedInitialValue,
    handleChange,
    handleExecuteCommand,
    toggleReviewMode,
    handleHighlightChange
  };
};
