
// FIX: Switched to namespace import for React to solve JSX intrinsic element type errors.
import * as React from 'react';
import { CloseIcon, ClipboardCheckIcon, ShareIcon } from './icons';

interface ARQRCodeModalProps {
  shareUrl: string;
  modelTitle: string;
  onClose: () => void;
}

const ARQRCodeModal: React.FC<ARQRCodeModalProps> = ({ shareUrl, modelTitle, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-sm relative border border-slate-700 text-center p-8 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          onClick={onClose}
          aria-label="Close QR code viewer"
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-slate-700 transition-colors"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-white mb-2">View in AR</h2>
        <p className="text-slate-400 mb-6 text-sm">Scan with your phone to view "{modelTitle}" in your space.</p>

        <div className="bg-white p-2 rounded-lg inline-block">
            <img src={qrCodeUrl} alt={`QR code for ${modelTitle}`} width="256" height="256" />
        </div>
        
        <p className="text-xs text-slate-500 mt-4">Point your device's camera at the code.</p>

        <div className="w-full mt-8">
            <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 text-cyan-300 font-semibold py-2 px-4 rounded-md hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
            >
                {copied ? (
                    <>
                        <ClipboardCheckIcon className="w-5 h-5" />
                        Link Copied!
                    </>
                ) : (
                    <>
                        <ShareIcon className="w-5 h-5" />
                        Copy Link
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ARQRCodeModal;