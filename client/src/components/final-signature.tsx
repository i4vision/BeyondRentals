import { useRef, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface FinalSignatureProps {
  onSignatureChange: (signature: string | null) => void;
  className?: string;
}

export default function FinalSignature({ onSignatureChange, className = "" }: FinalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const statusEl = statusRef.current;
    if (!canvas || !statusEl) return;

    // Canvas setup
    canvas.width = 500;
    canvas.height = 150;
    
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // State variables (outside React)
    let isDrawing = false;
    let hasContent = false;
    let lastX = 0;
    let lastY = 0;

    const updateStatus = (drawing: boolean) => {
      statusEl.textContent = drawing ? 'Drawing...' : 'Click and drag to sign';
    };

    const getCoords = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX: number, clientY: number;
      if (e.type.includes('touch')) {
        const touch = (e as TouchEvent).touches?.[0] || (e as TouchEvent).changedTouches?.[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const start = (e: Event) => {
      e.preventDefault();
      isDrawing = true;
      const coords = getCoords(e as MouseEvent | TouchEvent);
      lastX = coords.x;
      lastY = coords.y;
      updateStatus(true);
      
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
    };

    const move = (e: Event) => {
      e.preventDefault();
      if (!isDrawing) return;

      const coords = getCoords(e as MouseEvent | TouchEvent);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      
      lastX = coords.x;
      lastY = coords.y;
      hasContent = true;
      
      // Notify parent
      onSignatureChange(canvas.toDataURL());
    };

    const end = (e: Event) => {
      e.preventDefault();
      isDrawing = false;
      updateStatus(false);
    };

    // Event listeners
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseleave', end);
    
    canvas.addEventListener('touchstart', start);
    canvas.addEventListener('touchmove', move);
    canvas.addEventListener('touchend', end);

    // Cleanup
    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mouseup', end);
      canvas.removeEventListener('mouseleave', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', move);
      canvas.removeEventListener('touchend', end);
    };
  }, [onSignatureChange]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onSignatureChange(null);
  };

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      <div className="relative mb-4">
        <canvas
          ref={canvasRef}
          className="border-2 border-dashed border-gray-300 rounded w-full bg-white"
          style={{
            touchAction: 'none',
            cursor: 'crosshair',
            height: '150px'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-gray-400 text-sm">Draw your signature here</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span ref={statusRef} className="text-xs text-gray-500">
          Click and drag to sign
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Eraser className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}