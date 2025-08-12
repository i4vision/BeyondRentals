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
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize canvas only if needed
    if (canvas.width === 0) {
      canvas.width = 400;
      canvas.height = 120;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 400, 120);
      console.log('Canvas initialized');
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e);
    isDrawingRef.current = true;
    lastPointRef.current = pos;

    // Draw a large visible dot with multiple methods
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    
    // Method 1: Fill circle
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Method 2: Stroke circle for extra visibility
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Method 3: Fill rect as backup
    ctx.fillRect(pos.x - 3, pos.y - 3, 6, 6);

    console.log('Mouse down at:', pos.x, pos.y, 'Dot drawn at', pos.x, pos.y);
    onSignatureChange(canvas.toDataURL());
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e);
    
    // Draw extra thick line with multiple methods
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Method 1: Normal stroke
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    // Method 2: Fill path for extra visibility
    ctx.fillStyle = '#000000';
    const dx = pos.x - lastPointRef.current.x;
    const dy = pos.y - lastPointRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    for (let i = 0; i < distance; i += 2) {
      const x = lastPointRef.current.x + (dx * i) / distance;
      const y = lastPointRef.current.y + (dy * i) / distance;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }

    lastPointRef.current = pos;
    console.log('Line drawn to:', pos.x, pos.y, 'Context exists:', !!ctx);
    onSignatureChange(canvas.toDataURL());
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    console.log('Mouse up - drawing ended');
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 400;
    canvas.height = 120;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 120);
    onSignatureChange(null);
    console.log('Canvas cleared');
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <canvas
        ref={canvasRef}
        width="400"
        height="120"
        className="border-2 border-solid border-gray-400 rounded cursor-crosshair"
        style={{ 
          width: '400px',
          height: '120px', 
          display: 'block',
          backgroundColor: 'white',
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