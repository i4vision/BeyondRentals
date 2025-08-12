import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface DrawCanvasProps {
  onSignatureChange: (signature: string | null) => void;
  className?: string;
}

export default function DrawCanvas({ onSignatureChange, className = "" }: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size and style
    canvas.width = 400;
    canvas.height = 120;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 120);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    let isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(x, y);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDrawing) return;
      const newX = (moveEvent.clientX - rect.left) * (canvas.width / rect.width);
      const newY = (moveEvent.clientY - rect.top) * (canvas.height / rect.height);
      ctx.lineTo(newX, newY);
      ctx.stroke();
      onSignatureChange(canvas.toDataURL());
    };

    const handleMouseUp = () => {
      isDrawing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 400;
    canvas.height = 120;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 120);
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
        onMouseDown={handleMouseDown}
      />
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">Click and drag to draw</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          className="text-red-600"
        >
          <Eraser className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}