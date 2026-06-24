import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Check } from 'lucide-react';

interface Props {
  onConfirm: (dataUrl: string) => void;
  loading?: boolean;
}

export const SignaturePad: React.FC<Props> = ({ onConfirm, loading }) => {
  const padRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    padRef.current?.clear();
    setIsEmpty(true);
  };

  const handleConfirm = () => {
    if (!padRef.current || padRef.current.isEmpty()) return;
    const dataUrl = padRef.current.getTrimmedCanvas().toDataURL('image/png');
    onConfirm(dataUrl);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-base text-slate-500 mb-3">
          Sign in the box below using your finger or stylus:
        </p>
        <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50">
          <SignatureCanvas
            ref={padRef}
            canvasProps={{
              className: 'w-full signature-canvas',
              style: { height: '240px', display: 'block' },
            }}
            backgroundColor="#f8fafc"
            penColor="#1e293b"
            onBegin={() => setIsEmpty(false)}
          />
          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-slate-300 text-xl font-medium select-none">Sign here</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-2 px-5 py-3.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-base font-medium"
        >
          <Eraser size={18} />
          Clear
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isEmpty || loading}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-base font-semibold"
        >
          <Check size={18} />
          {loading ? 'Saving…' : 'Confirm Signature'}
        </button>
      </div>
    </div>
  );
};
