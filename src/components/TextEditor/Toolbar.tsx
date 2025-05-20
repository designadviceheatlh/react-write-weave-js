
import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Undo,
  Redo,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleBold, handleUndo, handleRedo } from './utils/editorCommands';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  applyTextTransformation, 
  transformToUppercase, 
  transformToLowercase, 
  capitalizeWords, 
  capitalizeSentence 
} from './utils/textTransformations';

interface ToolbarProps {
  executeCommand: (command: string, value?: string | null) => void;
}

const Toolbar = ({ executeCommand }: ToolbarProps) => {
  return (
    <div className="flex items-center p-2 bg-white border-b">
      {/* Text style dropdown using Radix UI Select */}
      <div className="mr-2">
        <Select 
          defaultValue="p"
          onValueChange={(value) => executeCommand('formatBlock', value)}
        >
          <SelectTrigger className="h-9 w-[140px] text-sm border rounded-md">
            <SelectValue placeholder="Texto Normal" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="p">Texto Normal</SelectItem>
            <SelectItem value="h1">Título 1</SelectItem>
            <SelectItem value="h2">Título 2</SelectItem>
            <SelectItem value="h3">Título 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Undo/Redo */}
      <div className="flex space-x-1 border-r pr-2 mr-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => handleUndo(() => executeCommand('undo'))}
          className="h-8 w-8"
          title="Desfazer (Ctrl+Z)"
        >
          <Undo size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => handleRedo(() => executeCommand('redo'))}
          className="h-8 w-8"
          title="Refazer (Ctrl+Y)"
        >
          <Redo size={18} />
        </Button>
      </div>

      {/* Text formatting */}
      <div className="flex space-x-1 border-r pr-2 mr-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => handleBold(() => executeCommand('bold'))}
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
        
        {/* Text transformation dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              title="Transformar texto"
            >
              <Type size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-white">
            <DropdownMenuItem onClick={() => applyTextTransformation(transformToUppercase, () => executeCommand(''))}>
              MAIÚSCULAS
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => applyTextTransformation(transformToLowercase, () => executeCommand(''))}>
              minúsculas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => applyTextTransformation(capitalizeWords, () => executeCommand(''))}>
              Primeira Letra Maiúscula
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => applyTextTransformation(capitalizeSentence, () => executeCommand(''))}>
              Primeira letra da frase
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
