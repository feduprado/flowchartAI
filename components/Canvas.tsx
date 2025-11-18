import React, { useState, forwardRef } from 'react';
import type { FlowNode, Connection, Point, Theme, PanZoom } from '../types';
import { FlowNodeComponent } from './FlowNodeComponent';
import { ConnectionComponent } from './ConnectionComponent';
import { getNodeConnectorPoints } from '../utils/flowUtils';

interface CanvasProps {
  nodes: FlowNode[];
  connections: Connection[];
  selectedNodeIds: string[];
  selectedConnectionIds: string[];
  highlightedElements: { nodes: string[], connections: string[] };
  onNodeSelect: (ids: string[]) => void;
  onConnectionSelect: (ids: string[]) => void;
  onNodeMove: (id: string, newPosition: Point) => void;
  onNodeTextChange: (id: string, text: string) => void;
  onAddConnection: (fromNodeId: string, toNodeId: string) => void;
  theme: Theme;
  panZoom: PanZoom;
  onCanvasMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
  onCanvasMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onCanvasMouseUp: (e: React.MouseEvent) => void;
  onCanvasWheel: (e: React.WheelEvent) => void;
}

export const Canvas = forwardRef<SVGSVGElement, CanvasProps>(({
  nodes,
  connections,
  selectedNodeIds,
  selectedConnectionIds,
  highlightedElements,
  onNodeSelect,
  onConnectionSelect,
  onNodeMove,
  onNodeTextChange,
  onAddConnection,
  theme,
  panZoom,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasWheel
}, ref) => {
  const [draggedNode, setDraggedNode] = useState<{ id: string; offset: Point } | null>(null);
  const [tempConnection, setTempConnection] = useState<{ from: string; to: Point } | null>(null);
  
  const handleNodeMouseDown = (e: React.MouseEvent, node: FlowNode) => {
    e.stopPropagation();
    const isSelected = selectedNodeIds.includes(node.id);

    if (e.shiftKey) {
        onNodeSelect(isSelected ? selectedNodeIds.filter(id => id !== node.id) : [...selectedNodeIds, node.id]);
    } else if (!isSelected) {
        onNodeSelect([node.id]);
    }
    
    const clientRect = e.currentTarget.getBoundingClientRect();
    setDraggedNode({
      id: node.id,
      offset: {
        x: (e.clientX - clientRect.left) / panZoom.scale,
        y: (e.clientY - clientRect.top) / panZoom.scale,
      },
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRef = (ref as React.RefObject<SVGSVGElement>)?.current;
    if(!svgRef) return;

    onCanvasMouseMove(e);

    const canvasRect = svgRef.getBoundingClientRect();
    const mousePoint = {
        x: (e.clientX - canvasRect.left - panZoom.offset.x) / panZoom.scale,
        y: (e.clientY - canvasRect.top - panZoom.offset.y) / panZoom.scale,
    };

    if (draggedNode) {
      const newPosition = {
        x: mousePoint.x - draggedNode.offset.x,
        y: mousePoint.y - draggedNode.offset.y,
      };
      onNodeMove(draggedNode.id, newPosition);
    }

    if (tempConnection) {
      setTempConnection({ ...tempConnection, to: mousePoint });
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    onCanvasMouseUp(e);
    setDraggedNode(null);
    setTempConnection(null);
  }

  const handleConnectorDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const svgRef = (ref as React.RefObject<SVGSVGElement>)?.current;
    if(!svgRef) return;
    
    const canvasRect = svgRef.getBoundingClientRect();
    const mousePoint = {
        x: (e.clientX - canvasRect.left - panZoom.offset.x) / panZoom.scale,
        y: (e.clientY - canvasRect.top - panZoom.offset.y) / panZoom.scale,
    };

    setTempConnection({ from: nodeId, to: mousePoint });
  };
  
  const handleNodeMouseUpOnConnector = (e: React.MouseEvent, toNodeId: string) => {
    e.stopPropagation();
    if (tempConnection && tempConnection.from !== toNodeId) {
        onAddConnection(tempConnection.from, toNodeId);
    }
    setTempConnection(null);
  };
  

  return (
    <div className="w-full h-full">
      <svg
        id="flowchart-canvas"
        ref={ref}
        className="w-full h-full cursor-grab active:cursor-grabbing bg-white dark:bg-zinc-900"
        onMouseDown={onCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={onCanvasWheel}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
          </marker>
          <marker
            id="arrowhead-selected"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={theme === 'dark' ? '#60a5fa' : '#3b82f6'} />
          </marker>
            <filter id="highlight-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g transform={`translate(${panZoom.offset.x}, ${panZoom.offset.y}) scale(${panZoom.scale})`}>
          {connections.map((conn) => {
            const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
            const toNode = nodes.find((n) => n.id === conn.toNodeId);
            if (!fromNode || !toNode) return null;
            return (
              <ConnectionComponent
                key={conn.id}
                connection={conn}
                fromNode={fromNode}
                toNode={toNode}
                isSelected={selectedConnectionIds.includes(conn.id)}
                isHighlighted={highlightedElements.connections.includes(conn.id)}
                onSelect={() => onConnectionSelect([conn.id])}
                theme={theme}
              />
            );
          })}
          {tempConnection && (() => {
              const fromNode = nodes.find(n => n.id === tempConnection.from);
              if(!fromNode) return null;

              const { start } = getNodeConnectorPoints(fromNode, {position: tempConnection.to, width: 0, height: 0} as FlowNode);

              return (
                  <path
                      d={`M ${start.x} ${start.y} L ${tempConnection.to.x} ${tempConnection.to.y}`}
                      stroke={theme === 'dark' ? '#60a5fa' : '#3b82f6'}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      fill="none"
                      markerEnd="url(#arrowhead-selected)"
                  />
              );
          })()}
          {nodes.map((node) => (
            <FlowNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNodeIds.includes(node.id)}
              isHighlighted={highlightedElements.nodes.includes(node.id)}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onTextChange={onNodeTextChange}
              onConnectorDragStart={handleConnectorDragStart}
              onMouseUpOnConnector={handleNodeMouseUpOnConnector}
              theme={theme}
            />
          ))}
        </g>
      </svg>
    </div>
  );
});