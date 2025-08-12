import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface WorkingSignatureProps {
  onSignatureChange: (signature: string | null) => void;
  className?: string;
}

export default function WorkingSignature({ onSignatureChange, className = "" }: WorkingSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 500;
    canvas.height = 150;

    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawLine = (x0: number, y0: number, x1: number, y1: number) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    };

    const getEventPos = (e: Event) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX: number, clientY: number;

      if (e.type.startsWith('touch')) {
        const touch = (e as TouchEvent).touches[0] || (e as TouchEvent).changedTouches[0];
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

    let drawing = false;
    let lastPos = { x: 0, y: 0 };

    const startDraw = (e: Event) => {
      e.preventDefault();
      drawing = true;
      const pos = getEventPos(e);
      lastPos = pos;
      setIsDrawing(true);
      setLastX(pos.x);
      setLastY(pos.y);
    };

    const draw = (e: Event) => {
      e.preventDefault();
      if (!drawing) return;

      const pos = getEventPos(e);
      drawLine(lastPos.x, lastPos.y, pos.x, pos.y);
      lastPos = pos;
      setLastX(pos.x);
      setLastY(pos.y);
      
      setHasSignature(true);
      const dataUrl = canvas.toDataURL();
      // Use setTimeout to avoid state conflicts
      setTimeout(() => onSignatureChange(dataUrl), 0);
    };

    const stopDraw = (e: Event) => {
      e.preventDefault();
      if (drawing) {
        drawing = false;
        setIsDrawing(false);
      }
    };

    // Add event listeners
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);
    
    canvas.addEventListener('touchstart', startDraw);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('mouseout', stopDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDraw);
    };
  }, []); // Remove dependencies to prevent re-initialization

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setHasSignature(false);
    onSignatureChange(null);
  };

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      <div className="relative mb-4">
        <canvas
          ref={canvasRef}
          className="border-2 border-dashed border-gray-300 rounded w-full"
          style={{
            touchAction: 'none',
            cursor: 'crosshair',
            height: '150px',
            backgroundColor: 'white'
          }}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm">Sign here with your mouse or finger</span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {isDrawing ? 'Drawing...' : 'Click and drag to sign'}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Eraser className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}