
import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolbarProps {
  executeCommand: (command: string, value?: string | null) => void;
}

const Toolbar = ({ executeCommand }: ToolbarProps) => {
  // Custom handler for bold to ensure we use font-weight: 600
  const handleBold = () => {
    // First apply the standard bold command
    executeCommand('bold');
    
    // Then ensure all <b> and <strong> elements use font-weight: 600
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const strongElements = document.querySelectorAll('b, strong');
      strongElements.forEach(el => {
        if (range.intersectsNode(el)) {
          el.style.fontWeight = '600';
        }
      });
    }
  };

  return (
    <div className="flex items-center p-2 bg-white border-b">
      {/* Text style dropdown */}
      <div className="mr-2">
        <select 
          onChange={(e) => executeCommand('formatBlock', e.target.value)}
          className="h-9 px-2 border rounded-md text-sm"
          defaultValue="p"
        >
          <option value="p">Texto Normal</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
        </select>
      </div>

      {/* Text formatting */}
      <div className="flex space-x-1 border-r pr-2 mr-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBold}
          className="h-8 w-8"
        >
          <Bold size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => executeCommand('italic')}
          className="h-8 w-8"
        >
          <Italic size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => executeCommand('underline')}
          className="h-8 w-8"
        >
          <Underline size={18} />
        </Button>
      </div>

      {/* Text alignment */}
      <div className="flex space-x-1 border-r pr-2 mr-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => executeCommand('justifyLeft')}
          className="h-8 w-8"
        >
          <AlignLeft size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => executeCommand('justifyCenter')}
          className="h-8 w-8"
        >
          <AlignCenter size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => executeCommand('justifyRight')}
          className="h-8 w-8"
        >
          <AlignRight size={18} />
        </Button>
      </div>

      {/* Lists */}
      <div className="flex space-x-1">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => executeCommand('insertUnorderedList')}
          className="h-8 w-8"
        >
          <List size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => executeCommand('insertOrderedList')}
          className="h-8 w-8"
        >
          <ListOrdered size={18} />
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
