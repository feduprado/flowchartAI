import React, { useState, useRef, useEffect } from 'react';
import type { FlowNode, Theme } from '../types';
import { NODE_COLORS } from '../constants';

interface FlowNodeProps {
  node: FlowNode;
  isSelected: boolean;
  isHighlighted: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onTextChange: (id: string, text: string) => void;
  onConnectorDragStart: (e: React.MouseEvent, nodeId: string) => void;
  onMouseUpOnConnector: (e: React.MouseEvent, nodeId: string) => void;
  theme: Theme;
}

export const FlowNodeComponent: React.FC<FlowNodeProps> = ({
  node,
  isSelected,
  isHighlighted,
  onMouseDown,
  onTextChange,
  onConnectorDragStart,
  onMouseUpOnConnector,
  theme,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);
  
  const handleDoubleClick = () => {
    setIsEditing(true);
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
  };
  
  const handleTextBlur = () => {
    setIsEditing(false);
    onTextChange(node.id, editText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextBlur();
    }
  };

  // FIX: Changed SVGProps to SVGAttributes to fix type incompatibility when spreading props onto specific SVG elements.
  const getShape = (props: React.SVGAttributes<SVGElement>) => {
    const { width, height } = node;
    switch (node.type) {
      case 'start':
      case 'end':
        return <circle cx={width / 2} cy={height / 2} r={width / 2} {...props} />;
      case 'decision':
        return <polygon points={`${width / 2},0 0,${height / 2} ${width / 2},${height} ${width},${height / 2}`} {...props} />;
      case 'process':
      default:
        return <rect x="0" y="0" width={width} height={height} rx="5" ry="5" {...props} />;
    }
  };

  const colors = NODE_COLORS[theme][node.type];
  const highlightColor = theme === 'dark' ? '#FBBF24' : '#F59E0B';
  const selectionColor = theme === 'dark' ? '#60a5fa' : '#3b82f6';
  
  const strokeColor = isHighlighted ? highlightColor : (isSelected ? selectionColor : colors.stroke);
  const strokeWidth = isSelected || isHighlighted ? 3 : 2;

  return (
    <g
      transform={`translate(${node.position.x}, ${node.position.y})`}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseUp={(e) => onMouseUpOnConnector(e, node.id)}
      className="cursor-pointer"
      style={{ filter: isHighlighted ? 'url(#highlight-glow)' : 'none' }}
    >
      {/* Shape with fill and stroke */}
      {getShape({
          fill: colors.fill,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          className: "transition-all duration-150"
      })}

      {isEditing ? (
        <foreignObject x="5" y="5" width={node.width - 10} height={node.height - 10}>
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-2 rounded resize-none text-center bg-transparent focus:outline-none flex items-center justify-center"
            style={{ fontFamily: 'sans-serif', fontSize: '14px', color: colors.text }}
          />
        </foreignObject>
      ) : (
        <text
          x={node.width / 2}
          y={node.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={colors.text}
          className="select-none pointer-events-none"
          style={{ fontFamily: 'sans-serif', fontSize: '14px', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
        >
          {node.text}
        </text>
      )}
      
      {(isSelected || isHighlighted) && (
        <g>
            <circle
              cx={node.width}
              cy={node.height / 2}
              r="8"
              fill={selectionColor}
              className="cursor-crosshair"
              stroke="#fff"
              strokeWidth="2"
              onMouseDown={(e) => onConnectorDragStart(e, node.id)}
            />
             <text x={node.width} y={node.height/2} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="12" className="pointer-events-none">+</text>
        </g>
      )}
    </g>
  );
};
