import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface SignaturePadNativeProps {
  onSignatureChange: (signature: string | null) => void;
}

export default function SignaturePadNative({ onSignatureChange }: SignaturePadNativeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 150;
    
    // Set drawing styles
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Fill white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const startDrawing = (point: { x: number; y: number }) => {
    setIsDrawing(true);
    setLastPoint(point);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      // Don't clear or reset - just start a new path
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      // Draw a small dot to show start point
      ctx.lineTo(point.x + 0.1, point.y + 0.1);
      ctx.stroke();
    }
    console.log('Started drawing at:', point);
  };

  const draw = (currentPoint: { x: number; y: number }) => {
    if (!isDrawing || !lastPoint) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Draw line from last point to current point
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();
    
    setLastPoint(currentPoint);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    setLastPoint(null);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      // Force the drawing to stay by setting composite mode
      ctx.globalCompositeOperation = 'source-over';
      const dataURL = canvas.toDataURL();
      onSignatureChange(dataURL);
      console.log('Signature captured and persisted, data length:', dataURL.length);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      onSignatureChange(null);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="border-2 border-dashed border-gray-300 rounded bg-white" style={{ width: '600px', height: '150px' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          style={{ width: '600px', height: '150px', display: 'block', cursor: 'crosshair' }}
          onMouseDown={(e) => {
            e.preventDefault();
            startDrawing(getMousePos(e));
          }}
          onMouseMove={(e) => {
            e.preventDefault();
            draw(getMousePos(e));
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
          onMouseLeave={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            startDrawing(getTouchPos(e));
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            draw(getTouchPos(e));
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
        />
      </div>
      <Button 
        type="button" 
        variant="outline" 
        onClick={clearSignature}
        className="mt-2"
      >
        Clear Signature
      </Button>
    </div>
  );
}