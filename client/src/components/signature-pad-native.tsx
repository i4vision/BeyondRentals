import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface SignaturePadNativeProps {
  onSignatureChange: (signature: string | null) => void;
}

export default function SignaturePadNative({ onSignatureChange }: SignaturePadNativeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [strokes, setStrokes] = useState<{ x: number; y: number }[][]>([]);

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
    
    // Redraw all strokes
    strokes.forEach(stroke => {
      if (stroke.length > 1) {
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        stroke.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 150;
    
    redrawCanvas();
  }, [strokes]);

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
    setIsDrawing(true);
    setLastPoint(point);
    
    // Start a new stroke
    setStrokes(prev => [...prev, [point]]);
    console.log('Started drawing at:', point);
  };

  const draw = (currentPoint: { x: number; y: number }) => {
    if (!isDrawing || !lastPoint) return;
    
    // Add point to current stroke
    setStrokes(prev => {
      const newStrokes = [...prev];
      if (newStrokes.length > 0) {
        newStrokes[newStrokes.length - 1] = [...newStrokes[newStrokes.length - 1], currentPoint];
      }
      return newStrokes;
    });
    
    setLastPoint(currentPoint);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    setLastPoint(null);
    
    // Capture signature after strokes are updated
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dataURL = canvas.toDataURL();
        onSignatureChange(dataURL);
        console.log('Signature captured with', strokes.length, 'strokes, data length:', dataURL.length);
      }
    }, 10);
  };

  const clearSignature = () => {
    setStrokes([]);
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