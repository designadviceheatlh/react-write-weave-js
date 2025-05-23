
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
import { handleBold, handleUndo, handleRedo, handleInsertDivider } from './utils/editorCommands';
import { 
  applyTextTransformation, 
  transformToUppercase, 
  transformToLowercase, 
  capitalizeWords, 
  capitalizeSentence 
} from './utils/textTransformations';

const Toolbar = ({ executeCommand }) => {
  return (
    <div className="flex items-center p-2 bg-white border-b">
      {/* Text style dropdown */}
      <div className="mr-2">
        <select 
          className="h-9 w-[140px] text-sm border rounded-md px-2"
          defaultValue="p"
          onChange={(e) => executeCommand('formatBlock', e.target.value)}
        >
          <option value="p">Texto Normal</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
        </select>
      </div>

      {/* Undo/Redo */}
      <div className="flex space-x-1 border-r pr-2 mr-2">
        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => handleUndo(() => executeCommand('undo'))}
          title="Desfazer (Ctrl+Z)"
        >
          <Undo size={18} />
        </button>

        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => handleRedo(() => executeCommand('redo'))}
          title="Refazer (Ctrl+Y)"
        >
          <Redo size={18} />
        </button>
      </div>

      {/* Text formatting */}
      <div className="flex space-x-1 border-r pr-2 mr-2">
        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => handleBold(() => executeCommand('bold'))}
          title="Negrito (Ctrl+B)"
        >
          <Bold size={18} />
        </button>

        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => executeCommand('italic')}
          title="Itálico (Ctrl+I)"
        >
          <Italic size={18} />
        </button>

        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => executeCommand('underline')}
          title="Sublinhado (Ctrl+U)"
        >
          <Underline size={18} />
        </button>
        
        {/* Text transformation dropdown */}
        <div className="relative">
          <button 
            className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
            title="Transformar texto"
            onClick={(e) => {
              const menu = e.currentTarget.nextElementSibling;
              menu.classList.toggle('hidden');
            }}
          >
            <Type size={18} />
          </button>
          <div className="absolute left-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-10 hidden">
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                applyTextTransformation(transformToUppercase, () => executeCommand(''));
                document.querySelector('.relative .hidden')?.classList.add('hidden');
              }}
            >
              MAIÚSCULAS
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                applyTextTransformation(transformToLowercase, () => executeCommand(''));
                document.querySelector('.relative .hidden')?.classList.add('hidden');
              }}
            >
              minúsculas
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                applyTextTransformation(capitalizeWords, () => executeCommand(''));
                document.querySelector('.relative .hidden')?.classList.add('hidden');
              }}
            >
              Primeira Letra Maiúscula
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                applyTextTransformation(capitalizeSentence, () => executeCommand(''));
                document.querySelector('.relative .hidden')?.classList.add('hidden');
              }}
            >
              Primeira letra da frase
            </button>
          </div>
        </div>
      </div>

      {/* Text alignment */}
      <div className="flex space-x-1 border-r pr-2 mr-2">
        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => executeCommand('justifyLeft')}
          title="Alinhar à esquerda"
        >
          <AlignLeft size={18} />
        </button>

        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => executeCommand('justifyCenter')}
          title="Centralizar"
        >
          <AlignCenter size={18} />
        </button>

        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => executeCommand('justifyRight')}
          title="Alinhar à direita"
        >
          <AlignRight size={18} />
        </button>
      </div>

      {/* Lists */}
      <div className="flex space-x-1 border-r pr-2 mr-2">
        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Lista com marcadores"
        >
          <List size={18} />
        </button>

        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => executeCommand('insertOrderedList')}
          title="Lista numerada"
        >
          <ListOrdered size={18} />
        </button>
      </div>
      
      {/* Divider button */}
      <div className="flex space-x-1">
        <button 
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => handleInsertDivider(() => executeCommand(''))}
          title="Inserir divisor"
        >
          <SeparatorHorizontal size={18} />
        </button>
      </div>

      {/* Close dropdown when clicking outside */}
      <script dangerouslySetInnerHTML={{__html: `
        document.addEventListener('click', function(e) {
          if (!e.target.closest('.relative')) {
            document.querySelectorAll('.relative .absolute').forEach(menu => {
              menu.classList.add('hidden');
            });
          }
        });
      `}} />
    </div>
  );
};

export default Toolbar;
