export type NodeType = 'start' | 'process' | 'decision' | 'end';

export interface Point {
  x: number;
  y: number;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  text: string;
  position: Point;
  width: number;
  height: number;
}

export interface Connection {
  id:string;
  fromNodeId: string;
  toNodeId: string;
  label?: 'Sim' | 'Não' | string;
}

export interface PanZoom {
    scale: number;
    offset: Point;
}

export interface FlowchartState {
    nodes: FlowNode[];
    connections: Connection[];
    selectedNodeIds: string[];
    selectedConnectionIds: string[];
}

export interface HistoryState {
    past: FlowchartState[];
    present: FlowchartState;
    future: FlowchartState[];
}

export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

export type Theme = 'light' | 'dark';

// Types for Quality Analysis
export interface QualityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  nodeIds?: string[];
  connectionIds?: string[];
  rule: string;
  suggestedFix: string;
}

export interface QualityMetrics {
  structural: {
    startNodes: number;
    endNodes: number;
    unreachableNodes: number;
    deadEndNodes: number;
  };
  semantic: {
    decisionNodesWithoutQuestion: number;
    decisionConnectionsWithoutLabel: number;
  };
  complexity: {
    nodeCount: number;
    connectionCount: number;
    cyclomaticComplexity: number;
  };
}

export interface QualityAnalysis {
  score: number;
  issues: QualityIssue[];
  metrics: QualityMetrics;
  passedChecks: string[];
  failedChecks: string[];
}
