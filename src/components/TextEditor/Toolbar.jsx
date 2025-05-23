
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

import { 
  AppBar,
  Toolbar as MuiToolbar,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Menu,
  Tooltip,
  Paper
} from '@mui/material';

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
  
  // State for dropdown visibility and anchor element
  const [textTransformAnchor, setTextTransformAnchor] = useState(null);
  
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

  // Handle text transformation with dropdown
  const handleTransformText = (transformFn) => {
    applyTextTransformation(transformFn, () => executeCommand(''));
    handleCloseTextTransform();
  };

  // Open text transformation dropdown
  const handleOpenTextTransform = (event) => {
    setTextTransformAnchor(event.currentTarget);
  };

  // Close text transformation dropdown
  const handleCloseTextTransform = () => {
    setTextTransformAnchor(null);
  };

  // Check if text transform menu is open
  const isTextTransformOpen = Boolean(textTransformAnchor);

  // Get style for active state buttons
  const getActiveStyle = (command) => {
    return activeStates[command] ? { 
      backgroundColor: '#e0e0e0', 
      color: '#1976d2'
    } : {};
  };

  return (
    <Paper elevation={0} square className="border-b">
      <MuiToolbar variant="dense" className="flex flex-wrap items-center px-2 py-1">
        {/* Text style dropdown */}
        <FormControl 
          size="small" 
          variant="outlined" 
          className="mr-2 min-w-[140px]"
          sx={{ 
            marginRight: '8px',
            '& .MuiOutlinedInput-root': {
              height: '36px',
              fontSize: '14px'
            }
          }}
        >
          <Select
            defaultValue="p"
            onChange={(e) => executeCommand('formatBlock', e.target.value)}
            displayEmpty
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="p">Texto Normal</MenuItem>
            <MenuItem value="h1">Título 1</MenuItem>
            <MenuItem value="h2">Título 2</MenuItem>
            <MenuItem value="h3">Título 3</MenuItem>
          </Select>
        </FormControl>

        {/* Undo/Redo */}
        <div className="flex space-x-1 mr-2">
          <Tooltip title="Desfazer (Ctrl+Z)">
            <IconButton 
              size="small" 
              onClick={() => handleButtonClick('undo')}
              sx={{ padding: '8px' }}
            >
              <Undo size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refazer (Ctrl+Y)">
            <IconButton 
              size="small" 
              onClick={() => handleButtonClick('redo')}
              sx={{ padding: '8px' }}
            >
              <Redo size={20} />
            </IconButton>
          </Tooltip>
        </div>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: '28px', alignSelf: 'center' }} />

        {/* Text formatting */}
        <div className="flex space-x-1 mr-2">
          <Tooltip title="Negrito (Ctrl+B)">
            <IconButton 
              size="small"
              onClick={() => handleButtonClick('bold')}
              sx={{ 
                padding: '8px',
                ...getActiveStyle('bold')
              }}
            >
              <Bold size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Itálico (Ctrl+I)">
            <IconButton 
              size="small"
              onClick={() => handleButtonClick('italic')}
              sx={{ 
                padding: '8px',
                ...getActiveStyle('italic')
              }}
            >
              <Italic size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Sublinhado (Ctrl+U)">
            <IconButton 
              size="small"
              onClick={() => handleButtonClick('underline')}
              sx={{ 
                padding: '8px',
                ...getActiveStyle('underline')
              }}
            >
              <Underline size={20} />
            </IconButton>
          </Tooltip>
          
          {/* Text transformation dropdown */}
          <Tooltip title="Transformar texto">
            <IconButton 
              size="small"
              onClick={handleOpenTextTransform}
              sx={{ padding: '8px' }}
            >
              <Type size={20} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={textTransformAnchor}
            open={isTextTransformOpen}
            onClose={handleCloseTextTransform}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            sx={{ 
              '& .MuiPaper-root': { 
                minWidth: '200px',
                boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)'
              }
            }}
          >
            <MenuItem onClick={() => handleTransformText(transformToUppercase)}>
              MAIÚSCULAS
            </MenuItem>
            <MenuItem onClick={() => handleTransformText(transformToLowercase)}>
              minúsculas
            </MenuItem>
            <MenuItem onClick={() => handleTransformText(capitalizeWords)}>
              Primeira Letra Maiúscula
            </MenuItem>
            <MenuItem onClick={() => handleTransformText(capitalizeSentence)}>
              Primeira letra da frase
            </MenuItem>
          </Menu>
        </div>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: '28px', alignSelf: 'center' }} />

        {/* Text alignment */}
        <div className="flex space-x-1 mr-2">
          <Tooltip title="Alinhar à esquerda">
            <IconButton 
              size="small"
              onClick={() => handleButtonClick('justifyLeft')}
              sx={{ 
                padding: '8px',
                ...getActiveStyle('justifyLeft')
              }}
            >
              <AlignLeft size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Centralizar">
            <IconButton 
              size="small"
              onClick={() => handleButtonClick('justifyCenter')}
              sx={{ 
                padding: '8px',
                ...getActiveStyle('justifyCenter')
              }}
            >
              <AlignCenter size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Alinhar à direita">
            <IconButton 
              size="small"
              onClick={() => handleButtonClick('justifyRight')}
              sx={{ 
                padding: '8px',
                ...getActiveStyle('justifyRight')
              }}
            >
              <AlignRight size={20} />
            </IconButton>
          </Tooltip>
        </div>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: '28px', alignSelf: 'center' }} />

        {/* Lists */}
        <div className="flex space-x-1 mr-2">
          <Tooltip title="Lista com marcadores">
            <IconButton 
              size="small"
              onClick={() => handleButtonClick('insertUnorderedList')}
              sx={{ padding: '8px' }}
            >
              <List size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Lista numerada">
            <IconButton 
              size="small"
              onClick={() => handleButtonClick('insertOrderedList')}
              sx={{ padding: '8px' }}
            >
              <ListOrdered size={20} />
            </IconButton>
          </Tooltip>
        </div>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: '28px', alignSelf: 'center' }} />
        
        {/* Divider button */}
        <div className="flex space-x-1">
          <Tooltip title="Inserir divisor">
            <IconButton 
              size="small"
              onClick={() => handleButtonClick('insertDivider')}
              sx={{ padding: '8px' }}
            >
              <SeparatorHorizontal size={20} />
            </IconButton>
          </Tooltip>
        </div>
      </MuiToolbar>
    </Paper>
  );
};

export default Toolbar;
