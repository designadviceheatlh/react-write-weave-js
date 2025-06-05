
import React from 'react';
import { Divider } from '@mui/material';

const ToolbarSection = ({ children, showDivider = true }) => {
  return (
    <>
      <div className="flex space-x-1 mr-2">
        {children}
      </div>
      {showDivider && (
        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: '28px', alignSelf: 'center' }} />
      )}
    </>
  );
};

export default ToolbarSection;
