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
    // Always capture signature data, even if drawing appears empty
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.toDataURL();
      onSignatureChange(dataURL);
      console.log('Signature captured, isEmpty:', sigCanvas.current.isEmpty());
      
      // Force canvas to retain drawing
      const canvas = sigCanvas.current.getCanvas();
      if (canvas) {
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
      }
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="border-2 border-dashed border-gray-300 rounded bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: 600,
            height: 150,
            className: 'signature-canvas w-full',
            style: {
              width: '100%',
              height: '150px',
              display: 'block'
            }
          }}
          backgroundColor="white"
          penColor="black"
          minWidth={2}
          maxWidth={4}
          throttle={16}
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