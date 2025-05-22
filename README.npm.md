
# React Text Editor Component

Um componente de editor de texto Rico para React com suporte para formatação, listas e manipulação de conteúdo.

## Instalação

```bash
npm install react-text-editor-component
# ou
yarn add react-text-editor-component
```

## Uso básico

```jsx
import React, { useState } from 'react';
import TextEditor from 'react-text-editor-component';
import 'react-text-editor-component/dist/styles.css'; // Importe os estilos

function MyComponent() {
  const [content, setContent] = useState('');

  const handleEditorChange = (value) => {
    setContent(value.html);
  };

  return (
    <div>
      <h1>Meu Editor</h1>
      <TextEditor
        initialValue=""
        onChange={handleEditorChange}
        placeholder="Digite seu texto aqui..."
      />
    </div>
  );
}

export default MyComponent;
```

## Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| initialValue | string | O conteúdo HTML inicial do editor |
| onChange | function | Função chamada quando o conteúdo muda, recebe um objeto `{ content: string, html: string }` |
| placeholder | string | Texto placeholder quando o editor está vazio |
| className | string | Classes CSS adicionais para estilização |

## Recursos

- Formatação de texto (negrito, itálico, sublinhado, etc.)
- Listas ordenadas e não ordenadas
- Suporte para indentação de listas com Tab/Shift+Tab
- Inserção de divisores
- Colar conteúdo inteligente de várias fontes (Word, Google Docs, PDF, sites)
- Limpeza automática de HTML

## Customização

Você pode customizar a aparência do editor usando classes CSS ou sobrescrevendo os estilos padrão.

## Licença

MIT
