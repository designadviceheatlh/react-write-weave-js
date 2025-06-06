
import React, { useState, useEffect } from 'react';
import { Highlighter, Eraser, RotateCcw, List } from 'lucide-react';
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

  // Update highlight count when component mounts or editor changes
  useEffect(() => {
    if (editorRef.current) {
      const count = getAllHighlights(editorRef.current).length;
      setHighlightCount(count);
    }
  }, [editorRef.current]);

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

  return (
    <Paper elevation={0} square className="border-b bg-orange-50">
      <MuiToolbar variant="dense" className="flex flex-wrap items-center px-2 py-1">
        {/* Highlight actions */}
        <ToolbarSection>
          <ToolbarButton icon={Highlighter} tooltip="Grifar texto selecionado" onClick={handleHighlight} />
          <ToolbarButton icon={Eraser} tooltip="Remover grifo selecionado" onClick={handleRemoveHighlight} />
        </ToolbarSection>

        {/* Color selector */}
        <ToolbarSection>
          <div className="flex items-center space-x-3 px-3">
            <span className="text-sm text-gray-700 font-medium">Cor:</span>
            <div className="flex items-center space-x-2">
              {Object.entries(HIGHLIGHT_COLORS).map(([colorName, colorValue]) => (
                <button
                  key={colorName}
                  onClick={() => setSelectedColor(colorName)}
                  className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 ${
                    selectedColor === colorName 
                      ? 'border-gray-800 shadow-lg ring-2 ring-gray-400 ring-offset-1' 
                      : 'border-gray-400 hover:border-gray-600'
                  }`}
                  style={{
                    backgroundColor: colorValue
                  }}
                  title={`Cor: ${colorName.charAt(0).toUpperCase() + colorName.slice(1)}`}
                />
              ))}
            </div>
          </div>
        </ToolbarSection>

        {/* Clear all */}
        <ToolbarSection>
          <ToolbarButton
            icon={RotateCcw}
            tooltip="Limpar todos os grifos"
            onClick={handleClearAll}
            sx={{
              color: '#dc2626',
              '&:hover': {
                backgroundColor: '#fee2e2'
              }
            }}
          />
        </ToolbarSection>

        {/* Stats */}
        <ToolbarSection showDivider={false}>
          <div className="flex items-center space-x-2 px-3">
            <List size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Marcações: {highlightCount.toString().padStart(2, '0')}
            </span>
          </div>
        </ToolbarSection>
      </MuiToolbar>
    </Paper>
  );
};

export default ReviewToolbar;
