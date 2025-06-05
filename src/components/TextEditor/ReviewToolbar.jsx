
import React, { useState } from 'react';
import { 
  Highlighter, 
  Eraser, 
  RotateCcw,
  Eye,
  List
} from 'lucide-react';
import { 
  highlightSelection, 
  removeHighlight, 
  clearAllHighlights,
  getAllHighlights,
  HIGHLIGHT_COLORS 
} from './utils/highlightUtils';

const ReviewToolbar = ({ editorRef, onHighlightChange }) => {
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

  return (
    <div className="flex items-center p-2 bg-orange-50 border-b border-orange-200">
      <div className="flex items-center space-x-2 mr-4">
        <Eye size={16} className="text-orange-600" />
        <span className="text-sm font-medium text-orange-800">Modo Revisão</span>
      </div>
      
      {/* Highlight button */}
      <button
        onClick={handleHighlight}
        className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
        title="Grifar texto selecionado"
      >
        <Highlighter size={16} />
        <span>Grifar</span>
      </button>

      {/* Color selector */}
      <div className="flex items-center space-x-1 ml-2 mr-4">
        {Object.entries(HIGHLIGHT_COLORS).map(([colorName, colorValue]) => (
          <button
            key={colorName}
            onClick={() => setSelectedColor(colorName)}
            className={`w-6 h-6 rounded border-2 ${
              selectedColor === colorName ? 'border-gray-600' : 'border-gray-300'
            }`}
            style={{ backgroundColor: colorValue }}
            title={`Cor: ${colorName}`}
          />
        ))}
      </div>

      {/* Remove highlight */}
      <button
        onClick={handleRemoveHighlight}
        className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm mr-2"
        title="Remover grifo selecionado"
      >
        <Eraser size={16} />
        <span>Remover</span>
      </button>

      {/* Clear all */}
      <button
        onClick={handleClearAll}
        className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-red-50 hover:border-red-300 text-sm mr-4"
        title="Limpar todos os grifos"
      >
        <RotateCcw size={16} />
        <span>Limpar Tudo</span>
      </button>

      {/* Highlight counter */}
      <div className="flex items-center space-x-1 text-sm text-gray-600">
        <List size={16} />
        <span>{highlightCount} grifos</span>
      </div>
    </div>
  );
};

export default ReviewToolbar;
