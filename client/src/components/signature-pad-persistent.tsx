import { useRef, useEffect, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";

interface SignaturePadPersistentProps {
  onSignatureChange: (signature: string | null) => void;
}

// Global state outside React to persist signatures
let globalStrokes: { x: number; y: number }[][] = [];
let globalCanvasRef: HTMLCanvasElement | null = null;

export default function SignaturePadPersistent({ onSignatureChange }: SignaturePadPersistentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear and set background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing styles
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Redraw all strokes from global state
    globalStrokes.forEach((stroke, strokeIndex) => {
      if (stroke.length > 0) {
        ctx.beginPath();
        if (stroke.length === 1) {
          // Single point - draw a small dot
          ctx.arc(stroke[0].x, stroke[0].y, 1, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          // Multiple points - draw lines
          ctx.moveTo(stroke[0].x, stroke[0].y);
          stroke.slice(1).forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
      }
    });
    
    console.log('Redrawn canvas with', globalStrokes.length, 'global strokes');
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 150;
    globalCanvasRef = canvas;
    
    // Always redraw from global state when component mounts
    redrawCanvas();
    
    console.log('SignaturePadPersistent mounted with', globalStrokes.length, 'existing strokes');
  }, []);

  // Force redraw periodically to ensure strokes persist
  useEffect(() => {
    const interval = setInterval(() => {
      if (globalStrokes.length > 0 && canvasRef.current) {
        redrawCanvas();
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const startDrawing = (point: { x: number; y: number }) => {
    isDrawingRef.current = true;
    lastPointRef.current = point;
    
    // Start a new stroke in global state
    globalStrokes = [...globalStrokes, [point]];
    console.log('Started drawing, total global strokes:', globalStrokes.length);
  };

  const draw = (currentPoint: { x: number; y: number }) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    
    // Add point to current stroke in global state
    if (globalStrokes.length > 0) {
      const lastStrokeIndex = globalStrokes.length - 1;
      globalStrokes[lastStrokeIndex] = [...globalStrokes[lastStrokeIndex], currentPoint];
    }
    
    // Draw immediately on canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && lastPointRef.current) {
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    }
    
    lastPointRef.current = currentPoint;
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    
    isDrawingRef.current = false;
    lastPointRef.current = null;
    
    console.log('Stop drawing, global strokes:', globalStrokes.length);
    
    // Capture signature from canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      console.log('Signature captured with', globalStrokes.length, 'global strokes, data length:', dataURL.length);
      
      // Call parent callback without affecting global state
      onSignatureChange(dataURL);
    }
    
    // Force redraw to ensure persistence
    setTimeout(() => redrawCanvas(), 10);
  };

  const clearSignature = () => {
    console.log('CLEAR SIGNATURE - resetting global strokes');
    globalStrokes = [];
    redrawCanvas();
    onSignatureChange(null);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="border-2 border-dashed border-gray-300 rounded bg-white" style={{ width: '600px', height: '150px' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          style={{ width: '600px', height: '150px', display: 'block', cursor: 'crosshair' }}
          onMouseDown={(e) => {
            e.preventDefault();
            startDrawing(getMousePos(e));
          }}
          onMouseMove={(e) => {
            e.preventDefault();
            draw(getMousePos(e));
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
          onMouseLeave={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            startDrawing(getTouchPos(e));
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            draw(getTouchPos(e));
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
        />
      </div>
      <Button 
        type="button" 
        variant="outline" 
        onClick={clearSignature}
        className="mt-2"
      >
        Clear Signature
      </Button>
    </div>
  );
}