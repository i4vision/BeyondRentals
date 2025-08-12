import { useRef, useCallback } from "react";
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

  const handleEnd = useCallback(() => {
    if (sigCanvas.current) {
      const canvas = sigCanvas.current.getCanvas();
      console.log('Drawing ended, canvas exists:', !!canvas);
      
      // Multiple capture attempts to ensure we get the signature
      setTimeout(() => {
        if (sigCanvas.current) {
          const dataURL = sigCanvas.current.toDataURL();
          onSignatureChange(dataURL);
          console.log('Final signature capture, length:', dataURL.length);
        }
      }, 10);
      
      setTimeout(() => {
        if (sigCanvas.current) {
          const dataURL = sigCanvas.current.toDataURL();
          onSignatureChange(dataURL);
          console.log('Delayed signature capture, length:', dataURL.length);
        }
      }, 100);
      
      setTimeout(() => {
        if (sigCanvas.current) {
          const dataURL = sigCanvas.current.toDataURL();
          onSignatureChange(dataURL);
          console.log('Final delayed capture, length:', dataURL.length);
        }
      }, 200);
    }
  }, [onSignatureChange]);

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="border-2 border-dashed border-gray-300 rounded bg-white" style={{ width: '600px', height: '150px' }}>
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: 600,
            height: 150,
            className: 'signature-canvas'
          }}
          backgroundColor="white"
          penColor="black"
          minWidth={1}
          maxWidth={3}
          clearOnResize={false}
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