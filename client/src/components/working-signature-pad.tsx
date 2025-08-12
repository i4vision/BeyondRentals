import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface WorkingSignaturePadProps {
  onSignatureChange: (signature: string | null) => void;
}

export default function WorkingSignaturePad({ onSignatureChange }: WorkingSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width > 0) return; // Don't reinitialize if already setup
    
    canvas.width = 400;
    canvas.height = 120;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 120);
    
    console.log('Signature pad initialized once');
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Ensure canvas is initialized
    if (canvas.width === 0) {
      canvas.width = 400;
      canvas.height = 120;
      const initCtx = canvas.getContext('2d')!;
      initCtx.fillStyle = 'white';
      initCtx.fillRect(0, 0, 400, 120);
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawingRef.current = true;
    lastPointRef.current = { x, y };
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw multiple visible marks at once
    ctx.fillStyle = 'red';
    ctx.fillRect(x - 5, y - 5, 10, 10);
    
    ctx.fillStyle = 'blue';  
    ctx.fillRect(x - 3, y - 3, 6, 6);
    
    ctx.fillStyle = 'black';
    ctx.fillRect(x - 1, y - 1, 2, 2);
    
    // Also draw with stroke
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.stroke();
    
    console.log('Multiple marks drawn at', x, y, 'Canvas context:', !!ctx);
    onSignatureChange(canvas.toDataURL());
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawingRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw thick colorful line
    ctx.strokeStyle = 'purple';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Also draw filled rectangles along the path
    ctx.fillStyle = 'orange';
    ctx.fillRect(x - 4, y - 4, 8, 8);
    
    lastPointRef.current = { x, y };
    console.log('Colorful line drawn to', x, y);
    onSignatureChange(canvas.toDataURL());
  };

  const handleMouseUp = () => {
    drawingRef.current = false;
    console.log('Drawing finished');
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 120);
    
    onSignatureChange(null);
    console.log('Signature cleared');
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <canvas
        ref={canvasRef}
        width="400"
        height="120"
        style={{ 
          border: '2px solid red',
          display: 'block'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">Click and drag to sign</span>
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