
import React from 'react';
import { FormControl, Select, MenuItem } from '@mui/material';

const TextStyleSelector = ({ executeCommand }) => {
  return (
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
  );
};

export default TextStyleSelector;
