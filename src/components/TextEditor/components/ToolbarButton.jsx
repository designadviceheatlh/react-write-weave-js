
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';

const ToolbarButton = ({ 
  icon: Icon, 
  tooltip, 
  onClick, 
  isActive = false, 
  ...props 
}) => {
  const getActiveStyle = () => {
    return isActive ? { 
      backgroundColor: '#e0e0e0', 
      color: '#1976d2'
    } : {};
  };

  return (
    <Tooltip title={tooltip}>
      <IconButton 
        size="small"
        onClick={onClick}
        sx={{ 
          padding: '8px',
          ...getActiveStyle()
        }}
        {...props}
      >
        <Icon size={20} />
      </IconButton>
    </Tooltip>
  );
};

export default ToolbarButton;
