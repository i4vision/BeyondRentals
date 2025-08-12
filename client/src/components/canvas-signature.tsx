import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface CanvasSignatureProps {
  onSignatureChange: (signature: string | null) => void;
  className?: string;
}

export default function CanvasSignature({ onSignatureChange, className = "" }: CanvasSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasSignatureRef = useRef(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    canvas.width = 500;
    canvas.height = 150;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return ctx;
  }, []);

  const getEventCoords = useCallback((e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;

    if (e.type.startsWith('touch')) {
      const touch = (e as TouchEvent).touches?.[0] || (e as TouchEvent).changedTouches?.[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = setupCanvas();
    if (!ctx) return;

    drawingRef.current = true;
    const coords = getEventCoords(e.nativeEvent, canvas);
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  }, [setupCanvas, getEventCoords]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getEventCoords(e.nativeEvent, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    if (!hasSignatureRef.current) {
      hasSignatureRef.current = true;
    }
    
    onSignatureChange(canvas.toDataURL());
  }, [getEventCoords, onSignatureChange]);

  const stopDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawingRef.current = false;
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setupCanvas();
    hasSignatureRef.current = false;
    onSignatureChange(null);
  }, [setupCanvas, onSignatureChange]);

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      <div className="relative mb-4">
        <canvas
          ref={canvasRef}
          width={500}
          height={150}
          className="border-2 border-dashed border-gray-300 rounded w-full bg-white"
          style={{
            touchAction: 'none',
            cursor: 'crosshair',
            height: '150px',
            maxWidth: '100%'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-gray-400 text-sm">Sign here with mouse or touch</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">Draw your signature above</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Eraser className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}