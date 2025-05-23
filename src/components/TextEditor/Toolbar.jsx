
import React, { useState, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Undo,
  Redo,
  Type,
  SeparatorHorizontal
} from 'lucide-react';
import { handleBold, handleUndo, handleRedo, handleInsertDivider } from './utils/editorCommands';
import { 
  applyTextTransformation, 
  transformToUppercase, 
  transformToLowercase, 
  capitalizeWords, 
  capitalizeSentence 
} from './utils/textTransformations';

const Toolbar = ({ executeCommand }) => {
  // State to track active formatting states
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: true,
    justifyCenter: false,
    justifyRight: false
  });
  
  // State for dropdown visibility
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Effect to check formatting on selection change
  useEffect(() => {
    const checkFormatting = () => {
      setActiveStates({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight')
      });
    };

    // Listen for selection changes to update button states
    document.addEventListener('selectionchange', checkFormatting);
    
    // Cleanup
    return () => {
      document.removeEventListener('selectionchange', checkFormatting);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.toolbar-dropdown')) {
        setDropdownVisible(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle toolbar button click with visual feedback
  const handleButtonClick = (command, value = null) => {
    if (command === 'bold') {
      handleBold(() => executeCommand('bold'));
    } else if (command === 'undo') {
      handleUndo(() => executeCommand('undo'));
    } else if (command === 'redo') {
      handleRedo(() => executeCommand('redo'));
    } else if (command === 'insertDivider') {
      handleInsertDivider(() => executeCommand(''));
    } else {
      executeCommand(command, value);
    }
    
    // Update active states for toggled buttons
    if (['bold', 'italic', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight'].includes(command)) {
      setTimeout(() => {
        setActiveStates(prev => ({
          ...prev,
          [command]: document.queryCommandState(command)
        }));
      }, 100);
    }
  };

  // Handle text transformation with dropdown
  const handleTransformText = (transformFn) => {
    applyTextTransformation(transformFn, () => executeCommand(''));
    setDropdownVisible(false);
  };

  // Toggle dropdown visibility
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <div className="flex items-center p-2 bg-white border-b">
      {/* Text style dropdown */}
      <div className="mr-2">
        <select 
          className="h-9 w-[140px] text-sm border rounded-md px-2 hover:border-gray-400 focus:border-gray-500 transition-colors"
          defaultValue="p"
          onChange={(e) => executeCommand('formatBlock', e.target.value)}
        >
          <option value="p">Texto Normal</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
        </select>
      </div>

      {/* Undo/Redo */}
      <div className="flex space-x-1 border-r pr-2 mr-2">
        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200 transition-all"
          onClick={() => handleButtonClick('undo')}
          title="Desfazer (Ctrl+Z)"
        >
          <Undo size={18} />
        </button>

        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200 transition-all"
          onClick={() => handleButtonClick('redo')}
          title="Refazer (Ctrl+Y)"
        >
          <Redo size={18} />
        </button>
      </div>

      {/* Text formatting */}
      <div className="flex space-x-1 border-r pr-2 mr-2">
        <button 
          className={`h-8 w-8 flex items-center justify-center rounded transition-all ${activeStates.bold ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100 active:bg-gray-200'}`}
          onClick={() => handleButtonClick('bold')}
          title="Negrito (Ctrl+B)"
        >
          <Bold size={18} />
        </button>

        <button 
          className={`h-8 w-8 flex items-center justify-center rounded transition-all ${activeStates.italic ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100 active:bg-gray-200'}`}
          onClick={() => handleButtonClick('italic')}
          title="Itálico (Ctrl+I)"
        >
          <Italic size={18} />
        </button>

        <button 
          className={`h-8 w-8 flex items-center justify-center rounded transition-all ${activeStates.underline ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100 active:bg-gray-200'}`}
          onClick={() => handleButtonClick('underline')}
          title="Sublinhado (Ctrl+U)"
        >
          <Underline size={18} />
        </button>
        
        {/* Text transformation dropdown */}
        <div className="toolbar-dropdown relative">
          <button 
            className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200 transition-all"
            title="Transformar texto"
            onClick={toggleDropdown}
          >
            <Type size={18} />
          </button>
          <div className={`toolbar-dropdown-content ${dropdownVisible ? 'visible' : ''} mt-1`}>
            <button
              className="toolbar-dropdown-item"
              onClick={() => handleTransformText(transformToUppercase)}
            >
              MAIÚSCULAS
            </button>
            <button
              className="toolbar-dropdown-item"
              onClick={() => handleTransformText(transformToLowercase)}
            >
              minúsculas
            </button>
            <button
              className="toolbar-dropdown-item"
              onClick={() => handleTransformText(capitalizeWords)}
            >
              Primeira Letra Maiúscula
            </button>
            <button
              className="toolbar-dropdown-item"
              onClick={() => handleTransformText(capitalizeSentence)}
            >
              Primeira letra da frase
            </button>
          </div>
        </div>
      </div>

      {/* Text alignment */}
      <div className="flex space-x-1 border-r pr-2 mr-2">
        <button 
          className={`h-8 w-8 flex items-center justify-center rounded transition-all ${activeStates.justifyLeft ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100 active:bg-gray-200'}`}
          onClick={() => handleButtonClick('justifyLeft')}
          title="Alinhar à esquerda"
        >
          <AlignLeft size={18} />
        </button>

        <button 
          className={`h-8 w-8 flex items-center justify-center rounded transition-all ${activeStates.justifyCenter ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100 active:bg-gray-200'}`}
          onClick={() => handleButtonClick('justifyCenter')}
          title="Centralizar"
        >
          <AlignCenter size={18} />
        </button>

        <button 
          className={`h-8 w-8 flex items-center justify-center rounded transition-all ${activeStates.justifyRight ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100 active:bg-gray-200'}`}
          onClick={() => handleButtonClick('justifyRight')}
          title="Alinhar à direita"
        >
          <AlignRight size={18} />
        </button>
      </div>

      {/* Lists */}
      <div className="flex space-x-1 border-r pr-2 mr-2">
        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200 transition-all"
          onClick={() => handleButtonClick('insertUnorderedList')}
          title="Lista com marcadores"
        >
          <List size={18} />
        </button>

        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200 transition-all"
          onClick={() => handleButtonClick('insertOrderedList')}
          title="Lista numerada"
        >
          <ListOrdered size={18} />
        </button>
      </div>
      
      {/* Divider button */}
      <div className="flex space-x-1">
        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200 transition-all"
          onClick={() => handleButtonClick('insertDivider')}
          title="Inserir divisor"
        >
          <SeparatorHorizontal size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
