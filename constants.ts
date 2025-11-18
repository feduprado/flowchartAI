import type { NodeType } from './types';

export const NODE_DIMENSIONS: Record<NodeType, { width: number; height: number }> = {
  start: { width: 80, height: 80 },
  end: { width: 80, height: 80 },
  process: { width: 160, height: 80 },
  decision: { width: 180, height: 100 },
};

export const NODE_COLORS: Record<string, Record<NodeType, { fill: string; stroke: string; text: string }>> = {
  light: {
    start:    { fill: '#bbf7d0', stroke: '#4ade80', text: '#166534' }, // green
    end:      { fill: '#fecaca', stroke: '#f87171', text: '#991b1b' }, // red
    process:  { fill: '#bfdbfe', stroke: '#60a5fa', text: '#1e40af' }, // blue
    decision: { fill: '#fed7aa', stroke: '#fb923c', text: '#9a3412' }, // orange
  },
  dark: {
    start:    { fill: '#166534', stroke: '#22c55e', text: '#dcfce7' }, // green
    end:      { fill: '#991b1b', stroke: '#ef4444', text: '#fecaca' }, // red
    process:  { fill: '#1e40af', stroke: '#3b82f6', text: '#bfdbfe' }, // blue
    decision: { fill: '#9a3412', stroke: '#f97316', text: '#fed7aa' }, // orange
  }
};


export const CONNECTION_COLOR = {
    light: '#6b7280',
    dark: '#9ca3af'
};

export const SELECTED_CONNECTION_COLOR = {
    light: '#3b82f6',
    dark: '#60a5fa'
};

export const MOVE_INCREMENT = 10;