import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { HelpModal } from './components/HelpModal';
import { AiModal } from './components/AiModal';
import { Toast } from './components/Toast';
import { useFlowchartState } from './hooks/useFlowchartState';
import { usePanZoom } from './hooks/usePanZoom';
import { exportAsJson, exportAsSvg } from './utils/flowUtils';
import type { FlowNode, Connection, ToastMessage, Theme } from './types';
import { ZoomInIcon, ZoomOutIcon, CenterIcon, MoonIcon, SunIcon } from './components/icons';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isHelpVisible, setHelpVisible] = useState(false);
  const [isAiVisible, setAiVisible] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const {
    state,
    addNode,
    deleteSelected,
    undo,
    redo,
    canUndo,
    canRedo,
    setSelectedNodeIds,
    setSelectedConnectionIds,
    updateNodePosition,
    updateNodeText,
    addConnection,
    setNodesAndConnections,
    clearCanvas: clearFlowchart,
  } = useFlowchartState();
  
  const canvasRef = useRef<SVGSVGElement>(null);
  const { panZoom, setPanZoom, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, resetPanZoom } = usePanZoom(canvasRef);


  useEffect(() => {
    document.documentElement.classList.remove(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);
  
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  
  const handleClearCanvas = () => {
    if(window.confirm('Tem certeza de que deseja limpar o canvas? Esta ação não pode ser desfeita.')) {
        clearFlowchart();
        showToast('Canvas limpo', 'success');
    }
  };
  
  const handleApplyAiFlow = (data: { nodes: FlowNode[]; connections: Connection[] }) => {
    setNodesAndConnections(data.nodes, data.connections);
    setAiVisible(false);
    showToast('Fluxograma da IA gerado e aplicado!', 'success');
    setTimeout(() => centerView(), 100);
  };

  const handleExport = (format: 'json' | 'svg') => {
    if (state.nodes.length === 0) {
      showToast('O canvas está vazio. Nada para exportar.', 'error');
      return;
    }
    try {
      if (format === 'json') {
        exportAsJson(state.nodes, state.connections);
      } else {
        const svgElement = document.getElementById('flowchart-canvas');
        if (svgElement) {
          exportAsSvg(svgElement as unknown as SVGSVGElement);
        } else {
          throw new Error('Não foi possível encontrar o elemento SVG');
        }
      }
      showToast(`Exportado como ${format.toUpperCase()} com sucesso!`, 'success');
    } catch (error) {
      showToast(`A exportação falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
    }
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = JSON.parse(e.target?.result as string);
          if (result.nodes && result.connections) {
            setNodesAndConnections(result.nodes, result.connections);
            showToast('Fluxograma importado com sucesso!', 'success');
            setTimeout(() => centerView(), 100);
          } else {
            showToast('Formato JSON inválido para fluxograma.', 'error');
          }
        } catch (error) {
          showToast('Falha ao analisar o arquivo JSON.', 'error');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = ''; // Reset file input
  };
  
  const handleCopyToFigma = () => {
    showToast('Funcionalidade "Copiar para Figma" em desenvolvimento.', 'info');
  };

  const centerView = useCallback(() => {
    if (!canvasRef.current) return;
    if (state.nodes.length === 0) {
        resetPanZoom();
        return;
    }

    const { width: viewWidth, height: viewHeight } = canvasRef.current.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    state.nodes.forEach(node => {
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + node.width);
        maxY = Math.max(maxY, node.position.y + node.height);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth === 0 || contentHeight === 0) {
        const node = state.nodes[0];
        setPanZoom({
            scale: 1,
            offset: {
                x: viewWidth / 2 - (node.position.x + node.width / 2),
                y: viewHeight / 2 - (node.position.y + node.height / 2),
            }
        });
        return;
    }

    const padding = 100;
    const scaleX = (viewWidth - padding * 2) / contentWidth;
    const scaleY = (viewHeight - padding * 2) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1.5);

    const newOffsetX = (viewWidth - contentWidth * newScale) / 2 - minX * newScale;
    const newOffsetY = (viewHeight - contentHeight * newScale) / 2 - minY * newScale;

    setPanZoom({ scale: newScale, offset: { x: newOffsetX, y: newOffsetY } });
  }, [state.nodes, canvasRef, setPanZoom, resetPanZoom]);

  const zoom = useCallback((direction: 'in' | 'out') => {
    if (!canvasRef.current) return;
    const scaleAmount = direction === 'in' ? 1.2 : 1 / 1.2;
    const { width, height } = canvasRef.current.getBoundingClientRect();
    const center = { x: width / 2, y: height / 2 };

    const newScale = panZoom.scale * scaleAmount;
    const newOffsetX = center.x - (center.x - panZoom.offset.x) * scaleAmount;
    const newOffsetY = center.y - (center.y - panZoom.offset.y) * scaleAmount;

    setPanZoom({
        scale: Math.max(0.1, Math.min(newScale, 5)),
        offset: {x: newOffsetX, y: newOffsetY}
    });
  }, [panZoom, canvasRef, setPanZoom]);
  
  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === canvasRef.current) {
      // FIX: Use setSelectedNodeIds and setSelectedConnectionIds from useFlowchartState hook
      setSelectedNodeIds([]);
      setSelectedConnectionIds([]);
      handleMouseDown(e);
    }
  };

  const WelcomeMessage = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800/80 backdrop-blur-sm text-white p-6 rounded-lg shadow-xl border border-gray-700 max-w-md pointer-events-none">
        <h2 className="text-xl font-bold mb-4">Bem-vindo ao Construtor de Fluxogramas</h2>
        <ul className="space-y-2 text-sm list-none">
            <li>• Use os botões acima para adicionar nós</li>
            <li className="flex items-center gap-2">• 'Clique e arraste' o fundo para mover o canvas <div className="w-3 h-3 rounded-sm bg-white animate-ping"></div></li>
            <li>• <b>Shift + Clique</b> para mover nós</li>
            <li>• Duplo clique para editar texto</li>
            <li>• Use o botão "+" para conectar nós</li>
            <li>• Clique em <span className="font-bold text-lg">💎</span> IA para criar fluxos automaticamente</li>
        </ul>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 flex flex-col overflow-hidden font-sans">
        <div className="flex-grow relative">
             <Canvas
                ref={canvasRef}
                nodes={state.nodes}
                connections={state.connections}
                selectedNodeIds={state.selectedNodeIds}
                selectedConnectionIds={state.selectedConnectionIds}
                onNodeSelect={setSelectedNodeIds}
                onConnectionSelect={setSelectedConnectionIds}
                onNodeMove={updateNodePosition}
                onNodeTextChange={updateNodeText}
                onAddConnection={addConnection}
                highlightedElements={{nodes: [], connections: []}}
                theme={theme}
                panZoom={panZoom}
                onCanvasMouseDown={handleCanvasMouseDown}
                onCanvasMouseMove={handleMouseMove}
                onCanvasMouseUp={handleMouseUp}
                onCanvasWheel={handleWheel}
            />

            <Toolbar
                onAddNode={addNode}
                onDelete={deleteSelected}
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                onClear={handleClearCanvas}
                onShowAi={() => setAiVisible(true)}
                onExport={handleExport}
                onImportJson={handleImportJson}
                onCopyToFigma={handleCopyToFigma}
            />

            {state.nodes.length === 0 && <WelcomeMessage />}
            
            <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md">
                    <button onClick={() => zoom('out')} title="Zoom Out" className="p-1.5 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors"><ZoomOutIcon className="w-5 h-5"/></button>
                    <span className="w-12 text-center text-sm font-mono text-gray-700 dark:text-gray-300">{(panZoom.scale * 100).toFixed(0)}%</span>
                    <button onClick={() => zoom('in')} title="Zoom In" className="p-1.5 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors"><ZoomInIcon className="w-5 h-5"/></button>
                </div>
                <button onClick={centerView} title="Centralizar" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <CenterIcon className="w-4 h-4"/> Centralizar
                </button>
                <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Alterar Tema" className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    {theme === 'light' ? <MoonIcon className="w-5 h-5 text-gray-700"/> : <SunIcon className="w-5 h-5 text-gray-200"/>}
                </button>
                <div className="text-xs text-gray-400">Fluxogram Builder v1.0</div>
            </div>
            <div className="absolute top-16 right-4 z-10 p-2 bg-black/50 rounded-md text-center text-xs">
                <div>{state.nodes.length} nós</div>
                <div>{state.connections.length} conexões</div>
            </div>

            <footer className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-none">
                <div className="p-2 bg-black/50 rounded-md text-xs pointer-events-auto">
                    Zoom: {(panZoom.scale * 100).toFixed(0)}% | Arraste para navegar
                </div>
                 <div className="p-2 bg-black/50 rounded-md text-center text-xs pointer-events-auto">
                    {state.nodes.length} nós, {state.connections.length} conexões
                </div>
                <div className="pointer-events-auto">
                    <button onClick={() => setHelpVisible(true)} className="px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700 transition-transform hover:scale-105">
                        Guia
                    </button>
                </div>
            </footer>
        </div>
      
      {isHelpVisible && <HelpModal onClose={() => setHelpVisible(false)} />}
      {isAiVisible && <AiModal onClose={() => setAiVisible(false)} onApply={handleApplyAiFlow} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;