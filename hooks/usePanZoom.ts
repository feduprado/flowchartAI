import { useState, useCallback, RefObject, MouseEvent, WheelEvent } from 'react';
import type { PanZoom, Point } from '../types';

export const usePanZoom = (ref: RefObject<SVGSVGElement>) => {
  const [panZoom, setPanZoom] = useState<PanZoom>({ scale: 1, offset: { x: 0, y: 0 } });
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: MouseEvent) => {
    setIsPanning(true);
    setStartPoint({ x: e.clientX - panZoom.offset.x, y: e.clientY - panZoom.offset.y });
  }, [panZoom.offset]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    const newOffsetX = e.clientX - startPoint.x;
    const newOffsetY = e.clientY - startPoint.y;
    setPanZoom(prev => ({ ...prev, offset: { x: newOffsetX, y: newOffsetY } }));
  }, [isPanning, startPoint]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY > 0 ? 1.1 : 0.9;
    const svgRect = ref.current?.getBoundingClientRect();
    if (!svgRect) return;

    const mousePoint = {
      x: e.clientX - svgRect.left,
      y: e.clientY - svgRect.top,
    };
    
    const newScale = panZoom.scale * scaleAmount;
    const newOffsetX = mousePoint.x - (mousePoint.x - panZoom.offset.x) * scaleAmount;
    const newOffsetY = mousePoint.y - (mousePoint.y - panZoom.offset.y) * scaleAmount;

    setPanZoom({
        scale: Math.max(0.1, Math.min(newScale, 5)),
        offset: {x: newOffsetX, y: newOffsetY}
    });

  }, [panZoom, ref]);
  
  const resetPanZoom = useCallback(() => {
    setPanZoom({ scale: 1, offset: { x: 0, y: 0 } });
  }, []);

  return { panZoom, setPanZoom, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, resetPanZoom };
};
