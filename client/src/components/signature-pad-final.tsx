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
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.toDataURL();
      onSignatureChange(dataURL);
      console.log('Signature captured');
    } else {
      console.log('Signature is empty');
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="border-2 border-dashed border-gray-300 rounded bg-white overflow-hidden" style={{ width: '400px', height: '120px' }}>
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: 400,
            height: 120,
            className: 'signature-canvas',
            style: {
              width: '400px',
              height: '120px',
              display: 'block'
            }
          }}
          backgroundColor="white"
          penColor="black"
          minWidth={2}
          maxWidth={4}
          dotSize={2}
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