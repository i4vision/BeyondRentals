import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";

interface SignaturePadFinalProps {
  onSignatureChange: (signature: string | null) => void;
}

export default function SignaturePadFinal({ onSignatureChange }: SignaturePadFinalProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      onSignatureChange(null);
    }
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      // Immediately capture the signature
      const dataURL = sigCanvas.current.toDataURL();
      onSignatureChange(dataURL);
      console.log('Signature captured immediately, isEmpty:', sigCanvas.current.isEmpty());
      
      // Force canvas background to ensure visibility
      const canvas = sigCanvas.current.getCanvas();
      if (canvas && !sigCanvas.current.isEmpty()) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Set white background behind the signature
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over';
          console.log('Forced white background for signature persistence');
        }
      }
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="border-2 border-dashed border-gray-300 rounded bg-white" style={{ width: '600px', height: '150px', overflow: 'hidden' }}>
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: 600,
            height: 150,
            className: 'signature-canvas',
            style: {
              width: '600px',
              height: '150px',
              display: 'block',
              touchAction: 'none'
            }
          }}
          backgroundColor="white"
          penColor="black"
          minWidth={2}
          maxWidth={4}
          clearOnResize={false}
          velocityFilterWeight={0.7}
          onEnd={handleEnd}
          onBegin={() => console.log('Signature started')}
        />
      </div>
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">Sign above using your mouse or touch</span>
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