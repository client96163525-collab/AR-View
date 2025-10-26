
import React, { useState } from 'react';
import { ModelData } from '../types';
import { ShareIcon, ClipboardCheckIcon } from './icons';

interface ModelCardProps {
  model: ModelData;
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('modelId', model.id);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-cyan-500/20 hover:ring-2 hover:ring-cyan-500/50 flex flex-col">
      <div className="w-full h-80 bg-slate-900">
        <model-viewer
          src={model.fileUrl}
          alt={model.title}
          ar
          camera-controls
          auto-rotate
          style={{ width: '100%', height: '100%', '--progress-bar-color': '#22d3ee' }}
        />
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-white">{model.title}</h3>
          {model.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{model.description}</p>}
        </div>
        <div className="mt-4">
          <button 
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-slate-700 text-cyan-300 font-semibold py-2 px-4 rounded-md hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
            aria-label={`Share ${model.title}`}
          >
            {copied ? (
              <>
                <ClipboardCheckIcon className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <ShareIcon className="w-5 h-5" />
                Share
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
