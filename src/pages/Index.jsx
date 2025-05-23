
import TextEditor from '../components/TextEditor';
import { useState } from 'react';

const Index = () => {
  const [editorValue, setEditorValue] = useState({
    content: '',
    html: ''
  });

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Editor de Texto</h1>
      
      <TextEditor 
        onChange={setEditorValue}
        className="mb-8"
        initialValue={`<p>Procedimentos Favoráveis</p>
<p>Rigidez, reforçamento ou reforço do ligamento cruzado anterior ou posterior # - procedimento videoartroscópico de joelho ou sutura de um menisco - procedimento videoartroscópico de joelho</p>
<p>artroplastia - estabilização, ressecção e/ou plastia # - procedimento videoartroscópico de joelho ligamentares periféricas crônicas - tratamento cirúrgico</p>
<h3>Procedimentos Desfavoráveis</h3>
<p>1. 30731119 - Tenoplastia / enxerto de tendão - tratamento cirúrgico</p>`}
      />

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Visualização em HTML:</h2>
        <pre className="p-4 bg-gray-100 rounded-md overflow-auto max-h-60 text-sm">
          {editorValue.html}
        </pre>
      </div>
    </div>
  );
};

export default Index;
