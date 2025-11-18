
import type { FlowNode, Point } from '../types';

export const getNodeConnectorPoints = (fromNode: FlowNode, toNode: FlowNode): { start: Point; end: Point } => {
    const fromCenter = { x: fromNode.position.x + fromNode.width / 2, y: fromNode.position.y + fromNode.height / 2 };
    const toCenter = { x: toNode.position.x + toNode.width / 2, y: toNode.position.y + toNode.height / 2 };

    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;

    let start = { ...fromCenter };
    let end = { ...toCenter };

    // Simple intersection logic for now
    if (Math.abs(dx) > Math.abs(dy)) { // More horizontal
        if (dx > 0) { // right
            start.x = fromNode.position.x + fromNode.width;
            end.x = toNode.position.x;
        } else { // left
            start.x = fromNode.position.x;
            end.x = toNode.position.x + toNode.width;
        }
    } else { // More vertical
        if (dy > 0) { // down
            start.y = fromNode.position.y + fromNode.height;
            end.y = toNode.position.y;
        } else { // up
            start.y = fromNode.position.y;
            end.y = toNode.position.y + toNode.height;
        }
    }

    return { start, end };
};

export const calculateMidpoint = (p1: Point, p2: Point, c1: Point, c2: Point): Point => {
    // For a cubic Bézier curve, the midpoint (t=0.5) is calculated as:
    // B(0.5) = 0.125*P0 + 0.375*P1 + 0.375*P2 + 0.125*P3
    const t = 0.5;
    const x = Math.pow(1 - t, 3) * p1.x + 3 * Math.pow(1 - t, 2) * t * c1.x + 3 * (1 - t) * Math.pow(t, 2) * c2.x + Math.pow(t, 3) * p2.x;
    const y = Math.pow(1 - t, 3) * p1.y + 3 * Math.pow(1 - t, 2) * t * c1.y + 3 * (1 - t) * Math.pow(t, 2) * c2.y + Math.pow(t, 3) * p2.y;
    return { x, y };
};


export const exportAsJson = (nodes: FlowNode[], connections: any[]) => {
  const data = JSON.stringify({ nodes, connections }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flowchart.json';
  a.click();
  URL.revokeObjectURL(url);
};

export const exportAsSvg = (svgElement: SVGSVGElement) => {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);
  
  // Add xml declaration
  if(!source.match(/^<\\?xml/)) {
    source = '<?xml version="1.0" standalone="no"?>\\r\\n' + source;
  }

  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flowchart.svg';
  a.click();
};
