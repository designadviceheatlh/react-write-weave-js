
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
    <div className="flex items-center p-3 bg-orange-50 border-b border-orange-200">
      {/* Mode indicator */}
      <div className="flex items-center space-x-2 mr-6">
        <Eye size={18} className="text-orange-600" />
        <span className="text-sm font-medium text-orange-800">Modo Revisão</span>
      </div>
      
      {/* Highlight actions group */}
      <div className="flex items-center space-x-3 mr-6">
        {/* Highlight button */}
        <button
          onClick={handleHighlight}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium shadow-sm"
          title="Grifar texto selecionado"
        >
          <Highlighter size={16} />
          <span>Grifar</span>
        </button>

        {/* Color selector */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm">
          <span className="text-xs text-gray-600 font-medium">Cor:</span>
          <div className="flex items-center space-x-1">
            {Object.entries(HIGHLIGHT_COLORS).map(([colorName, colorValue]) => (
              <button
                key={colorName}
                onClick={() => setSelectedColor(colorName)}
                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                  selectedColor === colorName 
                    ? 'border-gray-700 ring-2 ring-gray-300 ring-offset-1' 
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: colorValue }}
                title={`Cor: ${colorName.charAt(0).toUpperCase() + colorName.slice(1)}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Management actions group */}
      <div className="flex items-center space-x-3 mr-6">
        {/* Remove highlight */}
        <button
          onClick={handleRemoveHighlight}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium shadow-sm"
          title="Remover grifo selecionado"
        >
          <Eraser size={16} />
          <span>Remover</span>
        </button>

        {/* Clear all */}
        <button
          onClick={handleClearAll}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-sm font-medium text-red-700 shadow-sm"
          title="Limpar todos os grifos"
        >
          <RotateCcw size={16} />
          <span>Limpar Tudo</span>
        </button>
      </div>

      {/* Stats group */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm">
        <List size={16} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {highlightCount} {highlightCount === 1 ? 'grifo' : 'grifos'}
        </span>
      </div>
    </div>
  );
};

export default ReviewToolbar;
