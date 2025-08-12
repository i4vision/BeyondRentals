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
    if (!canvas) return;
    
    canvas.width = 400;
    canvas.height = 120;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 120);
    
    console.log('Signature pad initialized');
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawingRef.current = true;
    lastPointRef.current = { x, y };
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw starting dot
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    console.log('Drawing started at', x, y);
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
    
    // Draw line from last point to current point
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    lastPointRef.current = { x, y };
    console.log('Line drawn to', x, y);
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
        width={400}
        height={120}
        style={{ 
          border: '2px dashed #ccc',
          backgroundColor: 'white',
          display: 'block',
          cursor: 'crosshair'
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