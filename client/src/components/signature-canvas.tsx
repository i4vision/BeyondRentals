import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface SignatureCanvasProps {
  onSignatureChange: (signature: string | null) => void;
}

export default function SignatureCanvas({ onSignatureChange }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const pathsRef = useRef<Array<{x: number, y: number}[]>>([]);
  const currentPathRef = useRef<{x: number, y: number}[]>([]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing style
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Redraw all paths
    pathsRef.current.forEach(path => {
      if (path.length > 0) {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        path.forEach((point, index) => {
          if (index > 0) {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }
    });
    
    // Draw current path
    if (currentPathRef.current.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPathRef.current[0].x, currentPathRef.current[0].y);
      currentPathRef.current.forEach((point, index) => {
        if (index > 0) {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    }
  }, []);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
      canvas.width = 400;
      canvas.height = 120;
      // Set initial white background
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    drawingRef.current = true;
    const pos = getMousePos(e);
    currentPathRef.current = [pos];
    
    // Draw a small dot immediately for instant feedback
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    console.log('Started path at:', pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    
    const pos = getMousePos(e);
    const lastPos = currentPathRef.current[currentPathRef.current.length - 1];
    
    // Draw line segment immediately
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    currentPathRef.current.push(pos);
    onSignatureChange(canvasRef.current!.toDataURL());
    console.log('Added point:', pos.x, pos.y);
  };

  const stopDrawing = () => {
    if (!drawingRef.current) return;
    
    drawingRef.current = false;
    
    // Save current path to paths array
    if (currentPathRef.current.length > 0) {
      pathsRef.current.push([...currentPathRef.current]);
      currentPathRef.current = [];
    }
    
    console.log('Finished path, total paths:', pathsRef.current.length);
  };

  const clearSignature = () => {
    pathsRef.current = [];
    currentPathRef.current = [];
    drawingRef.current = false;
    
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = 400;
    canvas.height = 120;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    onSignatureChange(null);
    console.log('Signature cleared');
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full border-2 border-dashed border-gray-300 rounded bg-white cursor-crosshair"
        style={{ height: '120px', display: 'block' }}
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
          Clear
        </Button>
      </div>
    </div>
  );
}