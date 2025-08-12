import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SimpleCanvasProps {
  onSignatureChange: (signature: string | null) => void;
}

export default function SimpleCanvas({ onSignatureChange }: SimpleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const initializedRef = useRef(false);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || initializedRef.current) return;

    canvas.width = 400;
    canvas.height = 120;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    initializedRef.current = true;
    console.log('Canvas initialized:', canvas.width, 'x', canvas.height);
  };

  useEffect(() => {
    initializeCanvas();
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Start drawing');
    initializeCanvas(); // Ensure canvas is initialized
    
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d')!;
    
    // Set drawing styles each time to ensure they persist
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    isDrawingRef.current = true;
    
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    console.log('Mouse position:', x, y);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    
    console.log('Drawing...');
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d')!;
    
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    onSignatureChange(canvas.toDataURL());
  };

  const stopDrawing = () => {
    console.log('Stop drawing');
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    
    // Clear and reset
    canvas.width = 400;
    canvas.height = 120;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    onSignatureChange(null);
    console.log('Canvas cleared');
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <canvas
        ref={canvasRef}
        className="w-full border-2 border-dashed border-gray-300 rounded bg-white cursor-crosshair"
        style={{ height: '120px', display: 'block' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">Click and drag to sign</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          className="text-red-600"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}