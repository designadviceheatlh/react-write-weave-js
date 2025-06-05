
import React, { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { Type } from 'lucide-react';
import ToolbarButton from './ToolbarButton';
import { 
  applyTextTransformation, 
  transformToUppercase, 
  transformToLowercase, 
  capitalizeWords, 
  capitalizeSentence 
} from '../utils/textTransformations';

const TextTransformMenu = ({ executeCommand }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTransform = (transformFn) => {
    applyTextTransformation(transformFn, () => executeCommand(''));
    handleClose();
  };

  return (
    <>
      <ToolbarButton
        icon={Type}
        tooltip="Transformar texto"
        onClick={handleOpen}
      />
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
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
        <MenuItem onClick={() => handleTransform(transformToUppercase)}>
          MAIÚSCULAS
        </MenuItem>
        <MenuItem onClick={() => handleTransform(transformToLowercase)}>
          minúsculas
        </MenuItem>
        <MenuItem onClick={() => handleTransform(capitalizeWords)}>
          Primeira Letra Maiúscula
        </MenuItem>
        <MenuItem onClick={() => handleTransform(capitalizeSentence)}>
          Primeira letra da frase
        </MenuItem>
      </Menu>
    </>
  );
};

export default TextTransformMenu;
