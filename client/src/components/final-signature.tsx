import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface FinalSignatureProps {
  onSignatureChange: (signature: string | null) => void;
}

export default function FinalSignature({ onSignatureChange }: FinalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const initializeCanvas = (canvas: HTMLCanvasElement) => {
    canvas.width = 400;
    canvas.height = 120;
    const ctx = canvas.getContext('2d')!;
    
    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing properties
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    
    // Initialize canvas if needed
    if (canvas.width === 0) {
      initializeCanvas(canvas);
    }
    
    const coords = getCoordinates(e);
    const ctx = canvas.getContext('2d')!;
    
    // Reset drawing properties in case they were lost
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    setIsDrawing(true);
    setLastPosition(coords);
    
    // Draw a starting dot
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, 1, 0, 2 * Math.PI);
    ctx.fill();
    
    console.log('Drawing started at:', coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const coords = getCoordinates(e);
    
    // Draw line from last position to current position
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    setLastPosition(coords);
    onSignatureChange(canvas.toDataURL());
    
    console.log('Drawing line to:', coords.x, coords.y);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      console.log('Drawing stopped');
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    initializeCanvas(canvas);
    onSignatureChange(null);
    console.log('Canvas cleared');
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <canvas
        ref={canvasRef}
        className="w-full border-2 border-dashed border-gray-300 rounded bg-white cursor-crosshair"
        style={{ 
          height: '120px', 
          display: 'block', 
          touchAction: 'none',
          imageRendering: 'pixelated' // Ensure crisp rendering
        }}
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