import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Ajuda & Guia</h2>
          <button onClick={onClose} className="text-gray-500 text-3xl hover:text-gray-800 dark:hover:text-gray-200">&times;</button>
        </header>
        <main className="flex-grow p-6 overflow-y-auto">
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-primary-600 dark:text-primary-400">Regras de Sintaxe do Fluxograma</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Use colchetes `[]` para definir os tipos de nós: `[Início]`, `[Processo]`, `[Decisão]`, `[Fim]`.</li>
              <li>Cada nó deve estar em uma nova linha.</li>
              <li>Nós de decisão devem conter uma pergunta clara e objetiva terminando com `?`.</li>
              <li>As ramificações da decisão devem ser especificadas com `Sim:` e `Não:` nas linhas seguintes, apontando para o texto de outro nó.</li>
              <li>Deve haver exatamente um nó `[Início]`.</li>
              <li>Todos os caminhos devem eventualmente levar a um nó `[Fim]`.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-primary-600 dark:text-primary-400">Exemplo de Fluxo</h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-sm whitespace-pre-wrap">
{`[Início] Usuário faz login
[Processo] Sistema valida as credenciais
[Decisão] As credenciais são válidas?
Sim: [Processo] Exibir painel principal
Não: [Processo] Mostrar mensagem de erro
[Fim] Sessão do usuário termina`}
            </pre>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2 text-primary-600 dark:text-primary-400">Atalhos de Teclado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <p><kbd className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">Ctrl/Cmd + Z</kbd> : Desfazer</p>
                <p><kbd className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">Ctrl/Cmd + Y</kbd> : Refazer</p>
                <p><kbd className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">Delete/Backspace</kbd> : Excluir selecionado</p>
                <p><kbd className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">Setas</kbd> : Mover nós selecionados</p>
                <p><kbd className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">Arrastar com Mouse</kbd> : Mover o canvas</p>
                 <p><kbd className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">Clique Duplo no Nó</kbd> : Editar texto</p>
            </div>
          </section>
        </main>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">Entendido!</button>
        </footer>
      </div>
    </div>
  );
};
