import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface SimpleDrawProps {
  onSignatureChange: (signature: string | null) => void;
  className?: string;
}

export default function SimpleDraw({ onSignatureChange, className = "" }: SimpleDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    canvas.width = 400;
    canvas.height = 120;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 120);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    return ctx;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = initCanvas();
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);

    const handleMouseMove = (moveE: MouseEvent) => {
      const newX = (moveE.clientX - rect.left) * (canvas.width / rect.width);
      const newY = (moveE.clientY - rect.top) * (canvas.height / rect.height);
      ctx.lineTo(newX, newY);
      ctx.stroke();
      onSignatureChange(canvas.toDataURL());
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = initCanvas();
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);

    const handleTouchMove = (moveE: TouchEvent) => {
      moveE.preventDefault();
      const newTouch = moveE.touches[0];
      const newX = (newTouch.clientX - rect.left) * (canvas.width / rect.width);
      const newY = (newTouch.clientY - rect.top) * (canvas.height / rect.height);
      ctx.lineTo(newX, newY);
      ctx.stroke();
      onSignatureChange(canvas.toDataURL());
    };

    const handleTouchEnd = (endE: TouchEvent) => {
      endE.preventDefault();
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const clearSignature = () => {
    const ctx = initCanvas();
    onSignatureChange(null);
  };

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full border-2 border-dashed border-gray-300 rounded bg-white cursor-crosshair"
        style={{ touchAction: 'none', height: '120px' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">Sign above</span>
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