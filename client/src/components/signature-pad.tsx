import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface SignaturePadProps {
  onSignatureChange: (signature: string | null) => void;
  className?: string;
}

export default function SignaturePad({ onSignatureChange, className = "" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    
    // Initialize canvas if needed
    if (canvas.width === 0) {
      canvas.width = 400;
      canvas.height = 120;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }

    setDrawing(true);
    const point = getMousePos(e);
    setLastPoint(point);
    
    // Start new path
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const point = getMousePos(e);
    
    // Draw line from last point to current point
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    
    setLastPoint(point);
    onSignatureChange(canvas.toDataURL());
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = 400;
    canvas.height = 120;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    onSignatureChange(null);
  };

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full border-2 border-dashed border-gray-300 rounded bg-white cursor-crosshair"
        style={{ height: '120px' }}
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
          onClick={clearSignature}
          className="text-red-600"
        >
          <Eraser className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}