
import React from 'react';
import { ModelData } from '../types';
import { CloseIcon } from './icons';

interface FullScreenModelViewerProps {
  model: ModelData;
  onClose: () => void;
}

const FullScreenModelViewer: React.FC<FullScreenModelViewerProps> = ({ model, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 z-50">
      <model-viewer
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
      <button 
        onClick={onClose}
        aria-label="Close viewer"
        className="absolute top-4 right-4 bg-slate-800/50 text-white rounded-full p-2 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <CloseIcon className="w-6 h-6" />
      </button>
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/50 text-white px-4 py-2 rounded-full text-sm pointer-events-none">
        Drag to rotate, scroll to zoom, right-click + drag to pan.
      </div>
    </div>
  );
};

export default FullScreenModelViewer;
