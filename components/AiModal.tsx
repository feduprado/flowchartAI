

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateFlowchartFromText } from '../services/geminiService';
import type { FlowNode, Connection } from '../types';
import { Canvas } from './Canvas';
import { usePanZoom } from '../hooks/usePanZoom';

interface AiModalProps {
  onClose: () => void;
  onApply: (data: { nodes: FlowNode[]; connections: Connection[] }) => void;
}

const exampleText = `
[Início] Usuário abre o app da LATAM
[Processo] App exibe a tela inicial de busca de passagens
[Decisão] O usuário já possui login?
Sim: [Processo] O usuário preenche os dados da viagem (origem, destino, datas)
Não: [Processo] App solicita que o usuário faça login ou crie uma conta
[Processo] O usuário faz login com sucesso
[Processo] O usuário preenche os dados da viagem (origem, destino, datas)
[Processo] Usuário clica em "Buscar voos"
[Processo] App exibe a lista de voos disponíveis
[Decisão] O usuário encontrou um voo que o agrada?
Sim: [Processo] Usuário seleciona o voo e avança para a tela de pagamento
Não: [Processo] Usuário ajusta os filtros de busca e tenta novamente
[Processo] Usuário preenche os dados do passageiro e do pagamento
[Processo] App processa o pagamento
[Decisão] O pagamento foi aprovado?
Sim: [Processo] App confirma a compra e exibe o bilhete eletrônico
Não: [Processo] App exibe mensagem de erro no pagamento e oferece nova tentativa
[Fim] Compra de passagem concluída
`;

export const AiModal: React.FC<AiModalProps> = ({ onClose, onApply }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{ nodes: FlowNode[]; connections: Connection[] } | null>(null);

  const canvasRef = useRef<SVGSVGElement>(null);
  const { panZoom, setPanZoom, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, resetPanZoom } = usePanZoom(canvasRef);

  const centerView = useCallback(() => {
    if (!canvasRef.current || !previewData || previewData.nodes.length === 0) {
        resetPanZoom();
        return;
    }

    const { width: viewWidth, height: viewHeight } = canvasRef.current.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    previewData.nodes.forEach(node => {
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + node.width);
        maxY = Math.max(maxY, node.position.y + node.height);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth === 0 || contentHeight === 0) {
        const node = previewData.nodes[0];
        setPanZoom({
            scale: 1,
            offset: {
                x: viewWidth / 2 - (node.position.x + node.width / 2),
                y: viewHeight / 2 - (node.position.y + node.height / 2),
            }
        });
        return;
    }

    const padding = 50;
    const scaleX = (viewWidth - padding * 2) / contentWidth;
    const scaleY = (viewHeight - padding * 2) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1.5);

    const newOffsetX = (viewWidth - contentWidth * newScale) / 2 - minX * newScale;
    const newOffsetY = (viewHeight - contentHeight * newScale) / 2 - minY * newScale;

    setPanZoom({ scale: newScale, offset: { x: newOffsetX, y: newOffsetY } });
  }, [previewData, resetPanZoom, setPanZoom]);

  useEffect(() => {
    if (previewData) {
      setTimeout(() => centerView(), 100);
    }
  }, [previewData, centerView]);

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      setError('Please enter a description for the flowchart.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setPreviewData(null);
    try {
      const result = await generateFlowchartFromText(text);
      if (result.nodes && result.connections) {
        setPreviewData(result);
      } else {
        setError('AI could not generate a valid flowchart. Please check the syntax or try a different description.');
      }
    } catch (e) {
      setError(`An error occurred: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [text]);
  
  const handleUseExample = () => {
    setText(exampleText.trim());
    setPreviewData(null);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Generate Flowchart with AI</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">&times;</button>
        </header>
        
        <div className="flex-grow flex flex-col md:flex-row p-4 gap-4 overflow-y-auto">
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Describe your process</h3>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your process here using [NodeType] Text format..."
              className="w-full h-full flex-grow p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={15}
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={handleUseExample} className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                Use Example
              </button>
              <button onClick={handleGenerate} disabled={isLoading} className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-primary-400 transition-colors">
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div className="w-full md:w-2/3 flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <div className="flex-grow border rounded bg-gray-100 dark:bg-gray-900 overflow-hidden relative">
              {previewData ? (
                // FIX: Removed invalid onCanvasMouseLeave prop as it does not exist on CanvasProps. The Canvas component handles mouse leave events internally.
                <Canvas
                  ref={canvasRef}
                  nodes={previewData.nodes}
                  connections={previewData.connections}
                  selectedNodeIds={[]}
                  selectedConnectionIds={[]}
                  highlightedElements={{ nodes: [], connections: [] }}
                  onNodeSelect={() => {}}
                  onConnectionSelect={() => {}}
                  onNodeMove={() => {}}
                  onNodeTextChange={() => {}}
                  onAddConnection={() => {}}
                  theme="dark"
                  panZoom={panZoom}
                  onCanvasMouseDown={handleMouseDown}
                  onCanvasMouseMove={handleMouseMove}
                  onCanvasMouseUp={handleMouseUp}
                  onCanvasWheel={handleWheel}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {isLoading ? <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div> : 'Preview will appear here'}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
          <button onClick={() => previewData && onApply(previewData)} disabled={!previewData} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-primary-400 transition-colors">Apply to Canvas</button>
        </footer>
      </div>
    </div>
  );
};