import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface SimpleDrawProps {
  onSignatureChange: (signature: string | null) => void;
  className?: string;
}

export default function SimpleDraw({ onSignatureChange, className = "" }: SimpleDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 500;
    canvas.height = 150;

    const ctx = canvas.getContext('2d')!;
    
    // Initialize canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let lastX = 0;
    let lastY = 0;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX: number, clientY: number;
      if (e instanceof TouchEvent) {
        const touch = e.touches[0] || e.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
      
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;

      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      
      lastX = pos.x;
      lastY = pos.y;
      
      onSignatureChange(canvas.toDataURL());
    };

    const stopDrawing = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = false;
    };

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [onSignatureChange]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onSignatureChange(null);
  };

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full border-2 border-dashed border-gray-300 rounded bg-white cursor-crosshair"
        style={{ touchAction: 'none', height: '150px' }}
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