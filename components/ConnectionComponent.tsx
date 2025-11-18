import React from 'react';
import type { Connection, FlowNode, Theme } from '../types';
import { getNodeConnectorPoints, calculateMidpoint } from '../utils/flowUtils';

interface ConnectionProps {
  connection: Connection;
  fromNode: FlowNode;
  toNode: FlowNode;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: (id: string) => void;
  theme: Theme;
}

export const ConnectionComponent: React.FC<ConnectionProps> = ({
  connection,
  fromNode,
  toNode,
  isSelected,
  isHighlighted,
  onSelect,
  theme,
}) => {
  const { start, end } = getNodeConnectorPoints(fromNode, toNode);
  
  const controlX1 = start.x;
  const controlY1 = start.y + (end.y - start.y) / 2;
  const controlX2 = end.x;
  const controlY2 = end.y - (end.y - start.y) / 2;

  const pathData = `M ${start.x} ${start.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${end.x} ${end.y}`;
  
  const labelPosition = calculateMidpoint(start, end, {x: controlX1, y: controlY1}, {x: controlX2, y: controlY2});

  const highlightColor = theme === 'dark' ? '#FBBF24' : '#F59E0B';
  const selectionColor = theme === 'dark' ? '#60a5fa' : '#3b82f6';
  const defaultColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  
  const strokeColor = isHighlighted ? highlightColor : (isSelected ? selectionColor : defaultColor);
    
  return (
    <g style={{ filter: isHighlighted ? 'url(#highlight-glow)' : 'none' }}>
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="15"
        fill="none"
        onClick={() => onSelect(connection.id)}
        className="cursor-pointer"
      />
      <path
        d={pathData}
        stroke={strokeColor}
        strokeWidth={isSelected || isHighlighted ? 4 : 2}
        fill="none"
        markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
        style={{ transition: 'stroke 0.2s' }}
      />
      {connection.label && (
        <>
            <rect
                x={labelPosition.x - 20}
                y={labelPosition.y - 12}
                width={40}
                height={24}
                rx="8"
                ry="8"
                fill={theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(243, 244, 246, 0.8)'}
                stroke={isHighlighted ? highlightColor : 'transparent'}
                strokeWidth="1"
            />
            <text
                x={labelPosition.x}
                y={labelPosition.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={theme === 'dark' ? '#e5e7eb' : '#1f2937'}
                fontSize="12"
                fontWeight="bold"
                className="select-none"
            >
                {connection.label}
            </text>
        </>
      )}
    </g>
  );
};
