
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
  Type,
  SeparatorHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleBold, handleUndo, handleRedo, handleInsertDivider } from './utils/editorCommands';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface ToolbarProps {
  executeCommand: (command: string, value?: string | null) => void;
}

const Toolbar = ({ executeCommand }: ToolbarProps) => {
  return (
    <TooltipProvider>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleUndo(() => executeCommand('undo'))}
                className="h-8 w-8"
              >
                <Undo size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Desfazer (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleRedo(() => executeCommand('redo'))}
                className="h-8 w-8"
              >
                <Redo size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refazer (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Text formatting */}
        <div className="flex space-x-1 border-r pr-2 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleBold(() => executeCommand('bold'))}
                className="h-8 w-8"
              >
                <Bold size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Negrito (Ctrl+B)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => executeCommand('italic')}
                className="h-8 w-8"
              >
                <Italic size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Itálico (Ctrl+I)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => executeCommand('underline')}
                className="h-8 w-8"
              >
                <Underline size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sublinhado (Ctrl+U)</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Text transformation dropdown */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Transformar texto</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Text alignment */}
        <div className="flex space-x-1 border-r pr-2 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => executeCommand('justifyLeft')}
                className="h-8 w-8"
              >
                <AlignLeft size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Alinhar à esquerda</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => executeCommand('justifyCenter')}
                className="h-8 w-8"
              >
                <AlignCenter size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Centralizar</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => executeCommand('justifyRight')}
                className="h-8 w-8"
              >
                <AlignRight size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Alinhar à direita</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Lists */}
        <div className="flex space-x-1 border-r pr-2 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => executeCommand('insertUnorderedList')}
                className="h-8 w-8"
              >
                <List size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lista com marcadores</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => executeCommand('insertOrderedList')}
                className="h-8 w-8"
              >
                <ListOrdered size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lista numerada</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Divider button */}
        <div className="flex space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleInsertDivider(() => executeCommand(''))}
                className="h-8 w-8"
              >
                <SeparatorHorizontal size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Inserir divisor</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;
