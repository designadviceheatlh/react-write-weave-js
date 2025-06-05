import React from 'react';
import { Divider } from '@mui/material';
const ToolbarSection = ({
  children,
  showDivider = true
}) => {
  return <>
      <div className="flex space-x-1 mr-2">
        {children}
      </div>
      {showDivider}
    </>;
};
export default ToolbarSection;