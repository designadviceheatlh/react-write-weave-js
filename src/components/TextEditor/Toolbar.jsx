
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
  SeparatorHorizontal
} from 'lucide-react';
import { handleBold, handleUndo, handleRedo, handleInsertDivider } from './utils/editorCommands';
import { AppBar, Toolbar as MuiToolbar, Paper } from '@mui/material';
import ToolbarButton from './components/ToolbarButton';
import TextStyleSelector from './components/TextStyleSelector';
import TextTransformMenu from './components/TextTransformMenu';
import ToolbarSection from './components/ToolbarSection';

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

  return (
    <Paper elevation={0} square className="border-b">
      <MuiToolbar variant="dense" className="flex flex-wrap items-center px-2 py-1">
        {/* Text style dropdown */}
        <TextStyleSelector executeCommand={executeCommand} />

        {/* Undo/Redo */}
        <ToolbarSection>
          <ToolbarButton
            icon={Undo}
            tooltip="Desfazer (Ctrl+Z)"
            onClick={() => handleButtonClick('undo')}
          />
          <ToolbarButton
            icon={Redo}
            tooltip="Refazer (Ctrl+Y)"
            onClick={() => handleButtonClick('redo')}
          />
        </ToolbarSection>

        {/* Text formatting */}
        <ToolbarSection>
          <ToolbarButton
            icon={Bold}
            tooltip="Negrito (Ctrl+B)"
            onClick={() => handleButtonClick('bold')}
            isActive={activeStates.bold}
          />
          <ToolbarButton
            icon={Italic}
            tooltip="Itálico (Ctrl+I)"
            onClick={() => handleButtonClick('italic')}
            isActive={activeStates.italic}
          />
          <ToolbarButton
            icon={Underline}
            tooltip="Sublinhado (Ctrl+U)"
            onClick={() => handleButtonClick('underline')}
            isActive={activeStates.underline}
          />
          <TextTransformMenu executeCommand={executeCommand} />
        </ToolbarSection>

        {/* Text alignment */}
        <ToolbarSection>
          <ToolbarButton
            icon={AlignLeft}
            tooltip="Alinhar à esquerda"
            onClick={() => handleButtonClick('justifyLeft')}
            isActive={activeStates.justifyLeft}
          />
          <ToolbarButton
            icon={AlignCenter}
            tooltip="Centralizar"
            onClick={() => handleButtonClick('justifyCenter')}
            isActive={activeStates.justifyCenter}
          />
          <ToolbarButton
            icon={AlignRight}
            tooltip="Alinhar à direita"
            onClick={() => handleButtonClick('justifyRight')}
            isActive={activeStates.justifyRight}
          />
        </ToolbarSection>

        {/* Lists */}
        <ToolbarSection>
          <ToolbarButton
            icon={List}
            tooltip="Lista com marcadores"
            onClick={() => handleButtonClick('insertUnorderedList')}
          />
          <ToolbarButton
            icon={ListOrdered}
            tooltip="Lista numerada"
            onClick={() => handleButtonClick('insertOrderedList')}
          />
        </ToolbarSection>
        
        {/* Divider button */}
        <ToolbarSection showDivider={false}>
          <ToolbarButton
            icon={SeparatorHorizontal}
            tooltip="Inserir divisor"
            onClick={() => handleButtonClick('insertDivider')}
          />
        </ToolbarSection>
      </MuiToolbar>
    </Paper>
  );
};

export default Toolbar;
