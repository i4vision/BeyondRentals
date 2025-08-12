import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface SimpleDrawingPadProps {
  onSignatureChange: (signature: string | null) => void;
}

export default function SimpleDrawingPad({ onSignatureChange }: SimpleDrawingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    if (canvas.width === 0) {
      canvas.width = 400;
      canvas.height = 120;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.log('Canvas setup complete');
    }
    
    return canvas.getContext('2d')!;
  };

  const getPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = setupCanvas();
    if (!ctx) return;

    const pos = getPosition(e);
    isDrawingRef.current = true;
    lastPointRef.current = pos;

    // Draw starting point
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 1, 0, 2 * Math.PI);
    ctx.fill();

    console.log('Mouse down at:', pos.x, pos.y);
    onSignatureChange(canvasRef.current!.toDataURL());
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    
    const ctx = setupCanvas();
    if (!ctx) return;

    const pos = getPosition(e);
    
    // Set line style every time to prevent it being lost
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
    
    // Draw line from last point to current point
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPointRef.current = pos;
    console.log('Line drawn to:', pos.x, pos.y);
    onSignatureChange(canvasRef.current!.toDataURL());
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    console.log('Mouse up - drawing ended');
  };

  const handleClear = () => {
    const ctx = setupCanvas();
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 120);
    onSignatureChange(null);
    console.log('Canvas cleared');
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full border-2 border-dashed border-gray-300 rounded bg-white cursor-crosshair"
        style={{ 
          height: '120px', 
          display: 'block',
          touchAction: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">Click and drag to draw</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="text-red-600"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}