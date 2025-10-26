
import React from 'react';
import { ModelData } from '../types';
import { CloseIcon, DownloadIcon } from './icons';

interface FullScreenModelViewerProps {
  model: ModelData;
  onClose: () => void;
}

// Define a type for the <model-viewer> element to access its methods
interface ModelViewerElement extends HTMLElement {
  exportScene: (options?: { fileType: 'glb' | 'usdz' }) => Promise<Blob>;
}

const FullScreenModelViewer: React.FC<FullScreenModelViewerProps> = ({ model, onClose }) => {
  const modelViewerRef = React.useRef<ModelViewerElement>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = React.useState(false);
  const exportMenuRef = React.useRef<HTMLDivElement>(null);

  const handleExport = async (format: 'glb' | 'usdz') => {
    if (modelViewerRef.current) {
        try {
            const blob = await modelViewerRef.current.exportScene({ fileType: format });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const extension = format;
            // Sanitize title for filename
            const filename = model.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            a.download = `${filename || 'model'}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export model:', error);
            alert('Sorry, the model could not be exported. Please try again.');
        }
    }
    setIsExportMenuOpen(false); // Close menu after action
  };

  // Close the export menu when clicking outside of it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="fixed inset-0 bg-slate-900 z-50">
      <model-viewer
        ref={modelViewerRef}
        src={model.fileUrl}
        alt={model.title}
        ar
        camera-controls
        auto-rotate
        style={{ width: '100%', height: '100%', '--progress-bar-color': '#22d3ee' }}
      />
      <div className="absolute top-0 left-0 p-4 w-full bg-gradient-to-b from-black/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white truncate">{model.title}</h1>
          {model.description && <p className="text-sm text-slate-300 mt-1 truncate">{model.description}</p>}
        </div>
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="relative" ref={exportMenuRef}>
            <button
                onClick={() => setIsExportMenuOpen(prev => !prev)}
                aria-label="Export model"
                className="bg-slate-800/50 text-white rounded-full p-2 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                <DownloadIcon className="w-6 h-6" />
            </button>
            {isExportMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10">
                    <ul className="py-1">
                        <li>
                            <button
                                onClick={() => handleExport('glb')}
                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors duration-150"
                            >
                                Export as .GLB
                            </button>
                        </li>
                        <li>
                             <button
                                onClick={() => handleExport('usdz')}
                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors duration-150"
                            >
                                Export as .USDZ (for AR)
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
        <button 
          onClick={onClose}
          aria-label="Close viewer"
          className="bg-slate-800/50 text-white rounded-full p-2 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/50 text-white px-4 py-2 rounded-full text-sm pointer-events-none">
        Drag to rotate, scroll to zoom, right-click + drag to pan.
      </div>
    </div>
  );
};

export default FullScreenModelViewer;
