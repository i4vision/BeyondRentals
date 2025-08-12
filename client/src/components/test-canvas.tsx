import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface TestCanvasProps {
  onSignatureChange: (signature: string | null) => void;
}

export default function TestCanvas({ onSignatureChange }: TestCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Force canvas setup on mount
    canvas.width = 400;
    canvas.height = 120;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 120);
    
    // Draw test pattern to verify canvas works
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 50, 50);
    ctx.fillStyle = 'blue';
    ctx.fillRect(100, 10, 50, 50);
    ctx.fillStyle = 'green';  
    ctx.fillRect(200, 10, 50, 50);
    
    console.log('Canvas test pattern drawn');
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawingRef.current = true;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw big black dot
    ctx.fillStyle = 'black';
    ctx.fillRect(x - 10, y - 10, 20, 20);
    
    console.log('Black square drawn at', x, y);
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
    
    // Draw big black square
    ctx.fillStyle = 'black';
    ctx.fillRect(x - 5, y - 5, 10, 10);
    
    console.log('Black square drawn at', x, y);
    onSignatureChange(canvas.toDataURL());
  };

  const handleMouseUp = () => {
    drawingRef.current = false;
    console.log('Drawing stopped');
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 120);
    
    // Redraw test pattern
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 50, 50);
    ctx.fillStyle = 'blue';
    ctx.fillRect(100, 10, 50, 50);
    ctx.fillStyle = 'green';
    ctx.fillRect(200, 10, 50, 50);
    
    onSignatureChange(null);
    console.log('Canvas cleared and test pattern redrawn');
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-100">
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        style={{ 
          border: '3px solid black',
          backgroundColor: 'white',
          display: 'block'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">Test canvas - you should see colored squares</span>
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