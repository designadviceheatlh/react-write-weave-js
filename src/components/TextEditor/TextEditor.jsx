
import React from 'react';
import Toolbar from './Toolbar';
import ReviewToolbar from './ReviewToolbar';
import EditorContent from './EditorContent';
import ModeToggle from './components/ModeToggle';
import SaveIndicator from './components/SaveIndicator';
import { useTextEditorState } from './hooks/useTextEditorState';
import { cn } from '../../lib/utils';

const TextEditor = ({
  initialValue = '',
  onChange,
  placeholder = 'Digite seu texto aqui...',
  className
}) => {
  const {
    editorRef,
    isFocused,
    setIsFocused,
    isEmpty,
    setIsEmpty,
    isSaving,
    lastSaved,
    isReviewMode,
    sanitizedInitialValue,
    handleChange,
    handleExecuteCommand,
    toggleReviewMode,
    handleHighlightChange
  } = useTextEditorState(initialValue, onChange);

  return (
    <div className={cn("flex flex-col border rounded-md overflow-hidden relative", className)}>
      <ModeToggle isReviewMode={isReviewMode} onToggle={toggleReviewMode} />

      {/* Conditional toolbar */}
      {isReviewMode ? (
        <ReviewToolbar editorRef={editorRef} onHighlightChange={handleHighlightChange} />
      ) : (
        <Toolbar executeCommand={handleExecuteCommand} />
      )}
      
      <EditorContent 
        ref={editorRef}
        initialValue={sanitizedInitialValue} 
        placeholder={placeholder} 
        onChange={handleChange} 
        isEmpty={isEmpty} 
        isFocused={isFocused} 
        setIsFocused={setIsFocused} 
        setIsEmpty={setIsEmpty} 
        isReviewMode={isReviewMode} 
      />
      
      <SaveIndicator 
        isSaving={isSaving} 
        lastSaved={lastSaved} 
        isReviewMode={isReviewMode} 
      />
    </div>
  );
};

export default TextEditor;
