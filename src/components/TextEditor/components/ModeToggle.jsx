
import React from 'react';
import { Eye, Edit } from 'lucide-react';
import { cn } from '../../../lib/utils';

const ModeToggle = ({ isReviewMode, onToggle }) => {
  return (
    <div className="flex justify-between items-center p-2 bg-gray-50 border-b">
      <span className="text-sm text-gray-600">
        {isReviewMode ? 'Modo: Revisão' : 'Modo: Edição'}
      </span>
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          isReviewMode
            ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
        )}
      >
        {isReviewMode ? <Edit size={16} /> : <Eye size={16} />}
        <span>{isReviewMode ? 'Editar' : 'Revisar'}</span>
      </button>
    </div>
  );
};

export default ModeToggle;
