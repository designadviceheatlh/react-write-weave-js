
import React, { useRef, useState, useCallback } from 'react';
import { handlePaste } from './utils/pasteHandler';

interface EditorContentProps {
  initialValue: string;
  placeholder: string;
  onChange: () => void;
  isEmpty: boolean;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  setIsEmpty: (empty: boolean) => void;
}

const EditorContent: React.FC<EditorContentProps> = ({
  initialValue,
  placeholder,
  onChange,
  isEmpty,
  isFocused,
  setIsFocused,
  setIsEmpty
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  return (
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
        onInput={() => {
          onChange();
          setIsEmpty(editorRef.current?.textContent === '');
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={(e) => handlePaste(e, onChange)}
        data-testid="text-editor"
        dangerouslySetInnerHTML={{ __html: initialValue }}
      />
    </div>
  );
};

export default EditorContent;
