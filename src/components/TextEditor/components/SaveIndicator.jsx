
import React from 'react';
import { Check, Save } from 'lucide-react';

const SaveIndicator = ({ isSaving, lastSaved, isReviewMode }) => {
  if (isReviewMode) return null;

  return (
    <div className="absolute bottom-4 right-4 flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm border text-sm">
      {isSaving ? (
        <>
          <Save size={16} className="text-blue-600 animate-pulse mr-2" />
          <span>Salvando...</span>
        </>
      ) : lastSaved ? (
        <>
          <Check size={16} className="text-green-600 mr-2" />
          <span>Salvo às {lastSaved.toLocaleTimeString()}</span>
        </>
      ) : null}
    </div>
  );
};

export default SaveIndicator;
