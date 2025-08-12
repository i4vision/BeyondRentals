import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface SimpleSignatureProps {
  onSignatureChange: (signature: string | null) => void;
  className?: string;
}

export default function SimpleSignature({ onSignatureChange, className = "" }: SimpleSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set actual canvas size
    canvas.width = 600;
    canvas.height = 200;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Set up drawing style
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const getPos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if (e.type.includes('touch')) {
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDown = false;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDown = true;
      setIsDrawing(true);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDown) return;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        if (!hasSignature) {
          setHasSignature(true);
        }
        onSignatureChange(canvas.toDataURL());
      }
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (isDown) {
        isDown = false;
        setIsDrawing(false);
      }
    };

    // Mouse events
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    // Touch events
    canvas.addEventListener('touchstart', handleStart);
    canvas.addEventListener('touchmove', handleMove);
    canvas.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseleave', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
    };
  }, [hasSignature, onSignatureChange]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    setHasSignature(false);
    onSignatureChange(null);
  };

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full border-2 border-dashed border-gray-300 rounded cursor-crosshair bg-white"
          style={{ 
            touchAction: 'none',
            maxWidth: '100%',
            height: '200px'
          }}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-lg">Click and drag to sign here</p>
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-between items-center">
        <p className="text-xs text-gray-500">Draw your signature above</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSignature}
          className="text-sm text-red-500 hover:text-red-600"
        >
          <Eraser className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}