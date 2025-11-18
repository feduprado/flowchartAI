import { useReducer, useCallback } from 'react';
import type { FlowchartState, HistoryState, FlowNode, Connection, NodeType, Point } from '../types';
import { NODE_DIMENSIONS } from '../constants';

type Action =
  | { type: 'ADD_NODE'; payload: { type: NodeType; position?: Point } }
  | { type: 'DELETE_SELECTED' }
  | { type: 'SET_SELECTED_NODE_IDS'; payload: string[] }
  | { type: 'SET_SELECTED_CONNECTION_IDS'; payload: string[] }
  | { type: 'UPDATE_NODE_POSITION'; payload: { id: string; position: Point } }
  | { type: 'UPDATE_NODE_TEXT'; payload: { id: string; text: string } }
  | { type: 'ADD_CONNECTION'; payload: { from: string; to: string } }
  | { type: 'SET_NODES_AND_CONNECTIONS'; payload: { nodes: FlowNode[]; connections: Connection[] } }
  | { type: 'CLEAR_CANVAS' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const initialState: FlowchartState = {
  nodes: [],
  connections: [],
  selectedNodeIds: [],
  selectedConnectionIds: [],
};

const flowchartReducer = (state: FlowchartState, action: Action): FlowchartState => {
  switch (action.type) {
    case 'ADD_NODE': {
      const newNode: FlowNode = {
        id: `node_${Date.now()}`,
        type: action.payload.type,
        text: `[${action.payload.type.charAt(0).toUpperCase() + action.payload.type.slice(1)}]`,
        position: action.payload.position || { x: 100, y: 100 },
        ...NODE_DIMENSIONS[action.payload.type],
      };
      return { ...state, nodes: [...state.nodes, newNode], selectedNodeIds: [newNode.id], selectedConnectionIds: [] };
    }
    case 'DELETE_SELECTED': {
      return {
        ...state,
        nodes: state.nodes.filter(n => !state.selectedNodeIds.includes(n.id)),
        connections: state.connections.filter(c => 
            !state.selectedConnectionIds.includes(c.id) &&
            !state.selectedNodeIds.includes(c.fromNodeId) &&
            !state.selectedNodeIds.includes(c.toNodeId)
        ),
        selectedNodeIds: [],
        selectedConnectionIds: [],
      };
    }
    case 'SET_SELECTED_NODE_IDS':
      return { ...state, selectedNodeIds: action.payload, selectedConnectionIds: [] };
    case 'SET_SELECTED_CONNECTION_IDS':
       return { ...state, selectedConnectionIds: action.payload, selectedNodeIds: [] };
    case 'UPDATE_NODE_POSITION':
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id === action.payload.id ? { ...n, position: action.payload.position } : n
        ),
      };
    case 'UPDATE_NODE_TEXT':
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id === action.payload.id ? { ...n, text: action.payload.text } : n
        ),
      };
    case 'ADD_CONNECTION': {
      const fromNode = state.nodes.find(n => n.id === action.payload.from);
      const isFromDecision = fromNode?.type === 'decision';
      const existingConnectionsFromNode = state.connections.filter(c => c.fromNodeId === action.payload.from);

      let label: 'Sim' | 'Não' | undefined = undefined;
      if (isFromDecision) {
        const hasSim = existingConnectionsFromNode.some(c => c.label === 'Sim');
        label = hasSim ? 'Não' : 'Sim';
      }
      const newConnection: Connection = {
        id: `conn_${Date.now()}`,
        fromNodeId: action.payload.from,
        toNodeId: action.payload.to,
        label,
      };
      return { ...state, connections: [...state.connections, newConnection] };
    }
    case 'SET_NODES_AND_CONNECTIONS':
        return { ...initialState, ...action.payload };
    case 'CLEAR_CANVAS':
        return initialState;
    default:
      return state;
  }
};

const historyReducer = (state: HistoryState, action: Action): HistoryState => {
    const { past, present, future } = state;

    switch (action.type) {
        case 'UNDO':
            if (past.length === 0) return state;
            const previous = past[past.length - 1];
            const newPast = past.slice(0, past.length - 1);
            return {
                past: newPast,
                present: previous,
                future: [present, ...future],
            };
        case 'REDO':
            if (future.length === 0) return state;
            const next = future[0];
            const newFuture = future.slice(1);
            return {
                past: [...past, present],
                present: next,
                future: newFuture,
            };
        default:
            const newPresent = flowchartReducer(present, action);
            if (JSON.stringify(newPresent) === JSON.stringify(present)) {
                return state;
            }
            return {
                past: [...past, present],
                present: newPresent,
                future: [],
            };
    }
};


export const useFlowchartState = () => {
  const [state, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialState,
    future: [],
  });

  const dispatchWithHistory = (action: Exclude<Action, {type: 'UNDO' | 'REDO' | 'SET_SELECTED_NODE_IDS' | 'SET_SELECTED_CONNECTION_IDS' }>) => {
    dispatch(action);
  };
  
  const addNode = useCallback((type: NodeType) => {
      dispatchWithHistory({ type: 'ADD_NODE', payload: {type} });
  }, []);

  const deleteSelected = useCallback(() => {
    dispatchWithHistory({ type: 'DELETE_SELECTED' });
  }, []);

  const setSelectedNodeIds = useCallback((ids: string[]) => {
    dispatch({ type: 'SET_SELECTED_NODE_IDS', payload: ids });
  }, []);

  const setSelectedConnectionIds = useCallback((ids: string[]) => {
    dispatch({ type: 'SET_SELECTED_CONNECTION_IDS', payload: ids });
  }, []);

  const updateNodePosition = useCallback((id: string, position: Point) => {
    dispatchWithHistory({ type: 'UPDATE_NODE_POSITION', payload: { id, position } });
  }, []);

  const updateNodeText = useCallback((id: string, text: string) => {
    dispatchWithHistory({ type: 'UPDATE_NODE_TEXT', payload: { id, text } });
  }, []);

  const addConnection = useCallback((from: string, to: string) => {
    dispatchWithHistory({ type: 'ADD_CONNECTION', payload: { from, to } });
  }, []);
  
  const setNodesAndConnections = useCallback((nodes: FlowNode[], connections: Connection[]) => {
    dispatchWithHistory({ type: 'SET_NODES_AND_CONNECTIONS', payload: { nodes, connections } });
  }, []);

  const clearCanvas = useCallback(() => {
    dispatchWithHistory({ type: 'CLEAR_CANVAS' });
  }, []);

  const undo = useCallback(() => {
      dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
      dispatch({ type: 'REDO' });
  }, []);

  return {
    state: state.present,
    addNode,
    deleteSelected,
    setSelectedNodeIds,
    setSelectedConnectionIds,
    updateNodePosition,
    updateNodeText,
    addConnection,
    setNodesAndConnections,
    clearCanvas,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
};
