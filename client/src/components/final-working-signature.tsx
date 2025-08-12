import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface FinalWorkingSignatureProps {
  onSignatureChange: (signature: string | null) => void;
}

export default function FinalWorkingSignature({ onSignatureChange }: FinalWorkingSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    // Force canvas size in DOM
    canvas.width = 400;
    canvas.height = 120;
    canvas.style.width = '400px';
    canvas.style.height = '120px';
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return null;
    
    // Fill entire canvas with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 400, 120);
    
    return ctx;
  };

  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const ctx = initCanvas();
    if (!ctx) return;
    
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * canvas.width) / rect.width;
    const y = ((e.clientY - rect.top) * canvas.height) / rect.height;
    
    setIsDrawing(true);
    setLastPos({ x, y });
    
    // Draw immediate feedback - huge visible dot
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 5, y - 5, 10, 10);
    
    // Force canvas update
    canvas.style.border = '3px solid blue';
    setTimeout(() => {
      canvas.style.border = '2px solid red';
    }, 100);
    
    onSignatureChange(canvas.toDataURL());
    console.log('Started drawing at', x, y, 'Context valid:', !!ctx);
  };

  const handleMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const ctx = initCanvas();
    if (!ctx) return;
    
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * canvas.width) / rect.width;
    const y = ((e.clientY - rect.top) * canvas.height) / rect.height;
    
    // Draw thick black line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Also fill rectangles for extra visibility
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 2, y - 2, 4, 4);
    
    setLastPos({ x, y });
    onSignatureChange(canvas.toDataURL());
    console.log('Drawing line to', x, y);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    console.log('Finished drawing');
  };

  const handleClear = () => {
    const ctx = initCanvas();
    if (!ctx) return;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 400, 120);
    
    onSignatureChange(null);
    console.log('Canvas cleared');
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div style={{ border: '2px solid black', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          style={{
            display: 'block',
            border: '2px solid red',
            backgroundColor: 'white',
            cursor: 'crosshair'
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
        />
      </div>
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">Draw your signature above</span>
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