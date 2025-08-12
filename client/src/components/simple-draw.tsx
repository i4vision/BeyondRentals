import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface SimpleDrawProps {
  onSignatureChange: (signature: string | null) => void;
  className?: string;
}

export default function SimpleDraw({ onSignatureChange, className = "" }: SimpleDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  // Initialize canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 500;
    canvas.height = 150;
    const ctx = canvas.getContext('2d')!;
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Drawing started');
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas found');
      return;
    }

    const ctx = canvas.getContext('2d')!;
    
    // Set drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    console.log('Starting point:', x, y);
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Create event handlers
    const handleMove = (moveEvent: MouseEvent) => {
      if (!drawingRef.current) return;
      
      const newX = ((moveEvent.clientX - rect.left) / rect.width) * canvas.width;
      const newY = ((moveEvent.clientY - rect.top) / rect.height) * canvas.height;
      
      console.log('Drawing to:', newX, newY);
      ctx.lineTo(newX, newY);
      ctx.stroke();
      onSignatureChange(canvas.toDataURL());
    };

    const handleUp = () => {
      console.log('Drawing stopped');
      drawingRef.current = false;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const startTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    
    // Set drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);

    // Create event handlers
    const handleTouchMove = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();
      if (!drawingRef.current) return;
      
      const moveTouch = moveEvent.touches[0];
      const newX = ((moveTouch.clientX - rect.left) / rect.width) * canvas.width;
      const newY = ((moveTouch.clientY - rect.top) / rect.height) * canvas.height;
      
      ctx.lineTo(newX, newY);
      ctx.stroke();
      onSignatureChange(canvas.toDataURL());
    };

    const handleTouchEnd = (endEvent: TouchEvent) => {
      endEvent.preventDefault();
      drawingRef.current = false;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = 500;
    canvas.height = 150;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 500, 150);
    onSignatureChange(null);
  };

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      <canvas
        ref={canvasRef}
        width={500}
        height={150}
        className="w-full border-2 border-dashed border-gray-300 rounded bg-white cursor-crosshair"
        style={{ touchAction: 'none', height: '150px' }}
        onMouseDown={startDrawing}
        onTouchStart={startTouchDrawing}
      />
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">Hold and drag to draw</span>
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