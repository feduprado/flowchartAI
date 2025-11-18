import React, { useRef } from 'react';
import type { NodeType } from '../types';
import { TrashIcon, UndoIcon, RedoIcon, ClearIcon, SparklesIcon, ExportIcon, ImportIcon, FigmaIcon } from './icons';

interface ToolbarProps {
  onAddNode: (type: NodeType) => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  onShowAi: () => void;
  onExport: (format: 'json' | 'svg') => void;
  onImportJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCopyToFigma: () => void;
}

const NodeButton: React.FC<React.PropsWithChildren<{ onClick: () => void; color: string }>> = ({ onClick, color, children }) => (
    <button onClick={onClick} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
        {children}
    </button>
);

const ActionButton: React.FC<React.PropsWithChildren<{ onClick?: () => void; disabled?: boolean; title: string }>> = ({ onClick, disabled = false, title, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    {children}
  </button>
);

export const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onAddNode, onDelete, onUndo, onRedo, canUndo, canRedo, onClear, onShowAi, onExport, onImportJson, onCopyToFigma } = props;
  const importJsonRef = useRef<HTMLInputElement>(null);

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-2">Nós:</span>
            <NodeButton onClick={() => onAddNode('start')} color="#10B981">Início</NodeButton>
            <NodeButton onClick={() => onAddNode('process')} color="#3B82F6">Processo</NodeButton>
            <NodeButton onClick={() => onAddNode('decision')} color="#F59E0B">Decisão</NodeButton>
            <NodeButton onClick={() => onAddNode('end')} color="#EF4444">Fim</NodeButton>
            
            <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-1"></div>

            <ActionButton onClick={onDelete} title="Excluir"><TrashIcon className="w-4 h-4" /></ActionButton>
            <ActionButton onClick={onUndo} disabled={!canUndo} title="Desfazer"><UndoIcon className="w-4 h-4" /></ActionButton>
            <ActionButton onClick={onRedo} disabled={!canRedo} title="Refazer"><RedoIcon className="w-4 h-4" /></ActionButton>
            <ActionButton onClick={onClear} title="Limpar"><ClearIcon className="w-4 h-4" /></ActionButton>
            <ActionButton onClick={onShowAi} title="Gerar com IA"><SparklesIcon className="w-4 h-4" /></ActionButton>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-2">Arquivo:</span>
            <input type="file" accept=".json" ref={importJsonRef} onChange={onImportJson} style={{ display: 'none' }} />
            <ActionButton onClick={() => onExport('json')} title="Exportar JSON"><ExportIcon className="w-4 h-4" /> Exportar JSON</ActionButton>
            <ActionButton onClick={() => onExport('svg')} title="Exportar SVG"><ExportIcon className="w-4 h-4" /> Exportar SVG</ActionButton>
            <ActionButton onClick={() => importJsonRef.current?.click()} title="Importar JSON"><ImportIcon className="w-4 h-4" /> Importar JSON</ActionButton>
            <ActionButton onClick={onCopyToFigma} title="Copiar para Figma"><FigmaIcon className="w-4 h-4" /> Copiar para Figma</ActionButton>
        </div>
    </div>
  );
};
