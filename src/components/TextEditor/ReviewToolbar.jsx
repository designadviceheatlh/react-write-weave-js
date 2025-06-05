import React, { useState } from 'react';
import { Highlighter, Eraser, RotateCcw, Eye, List } from 'lucide-react';
import { highlightSelection, removeHighlight, clearAllHighlights, getAllHighlights, HIGHLIGHT_COLORS } from './utils/highlightUtils';
import { AppBar, Toolbar as MuiToolbar, Paper, Divider } from '@mui/material';
import ToolbarButton from './components/ToolbarButton';
import ToolbarSection from './components/ToolbarSection';
const ReviewToolbar = ({
  editorRef,
  onHighlightChange
}) => {
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [highlightCount, setHighlightCount] = useState(0);
  const handleHighlight = () => {
    const success = highlightSelection(selectedColor);
    if (success && onHighlightChange) {
      const count = getAllHighlights(editorRef.current).length;
      setHighlightCount(count);
      onHighlightChange();
    }
  };
  const handleRemoveHighlight = () => {
    const success = removeHighlight();
    if (success && onHighlightChange) {
      const count = getAllHighlights(editorRef.current).length;
      setHighlightCount(count);
      onHighlightChange();
    }
  };
  const handleClearAll = () => {
    const cleared = clearAllHighlights(editorRef.current);
    if (cleared > 0) {
      setHighlightCount(0);
      if (onHighlightChange) {
        onHighlightChange();
      }
    }
  };
  return <Paper elevation={0} square className="border-b bg-orange-50">
      <MuiToolbar variant="dense" className="flex flex-wrap items-center px-2 py-1">
        {/* Mode indicator */}
        <ToolbarSection>
          
        </ToolbarSection>
        
        {/* Highlight actions */}
        <ToolbarSection>
          <ToolbarButton icon={Highlighter} tooltip="Grifar texto selecionado" onClick={handleHighlight} />
          
          <ToolbarButton icon={Eraser} tooltip="Remover grifo selecionado" onClick={handleRemoveHighlight} />
        </ToolbarSection>

        {/* Color selector */}
        <ToolbarSection>
          <div className="flex items-center space-x-2 px-2">
            <span className="text-xs text-gray-600 font-medium">Cor:</span>
            <div className="flex items-center space-x-1">
              {Object.entries(HIGHLIGHT_COLORS).map(([colorName, colorValue]) => <button key={colorName} onClick={() => setSelectedColor(colorName)} className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === colorName ? 'border-gray-700 ring-2 ring-gray-300 ring-offset-1' : 'border-gray-300 hover:border-gray-500'}`} style={{
              backgroundColor: colorValue
            }} title={`Cor: ${colorName.charAt(0).toUpperCase() + colorName.slice(1)}`} />)}
            </div>
          </div>
        </ToolbarSection>

        {/* Clear all */}
        <ToolbarSection>
          <ToolbarButton icon={RotateCcw} tooltip="Limpar todos os grifos" onClick={handleClearAll} sx={{
          color: '#dc2626',
          '&:hover': {
            backgroundColor: '#fee2e2'
          }
        }} />
        </ToolbarSection>

        {/* Stats */}
        <ToolbarSection showDivider={false}>
          <div className="flex items-center space-x-2 px-2">
            <List size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {highlightCount} {highlightCount === 1 ? 'grifo' : 'grifos'}
            </span>
          </div>
        </ToolbarSection>
      </MuiToolbar>
    </Paper>;
};
export default ReviewToolbar;