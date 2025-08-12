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
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="border-2 border-dashed border-gray-300 rounded bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: 400,
            height: 120,
            className: 'signature-canvas',
            style: {
              width: '100%',
              height: '120px'
            }
          }}
          backgroundColor="white"
          penColor="black"
          minWidth={1}
          maxWidth={3}
          onEnd={handleEnd}
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