import React from 'react';
import { ModelData, GitHubConfig } from '../types';
import { ShareIcon, ClipboardCheckIcon, ARIcon } from './icons';
import ARQRCodeModal from './ARQRCodeModal';

interface ModelCardProps {
  model: ModelData;
  githubConfig: GitHubConfig | null;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, githubConfig }) => {
  const [copied, setCopied] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState<string | null>(null);
  const [isARModalOpen, setIsARModalOpen] = React.useState(false);

  const arPageUrl = React.useMemo(() => {
    try {
      const config = githubConfig;
      const baseUrl = config?.publicUrl || window.location.origin;
      
      const url = new URL(window.location.pathname, baseUrl);
      url.search = ''; // Clear existing params like modelId
      url.searchParams.set('ar', 'true');
      url.searchParams.set('modelUrl', model.fileUrl);
      url.searchParams.set('title', model.title);
      return url.toString();
    } catch (error) {
      console.error("Error creating AR page URL:", error);
      const url = new URL(window.location.href);
      url.search = '';
      url.searchParams.set('ar', 'true');
      url.searchParams.set('modelUrl', model.fileUrl);
      url.searchParams.set('title', model.title);
      return url.toString();
    }
  }, [model.fileUrl, model.title, githubConfig]);
  
  const fullShareUrl = React.useMemo(() => {
    try {
      const config = githubConfig;
      const baseUrl = config?.publicUrl || window.location.origin;
      
      const url = new URL(window.location.pathname, baseUrl);
      url.searchParams.set('modelId', model.id);
      return url.toString();
    } catch (error) {
      console.error("Error creating share URL:", error);
      const url = new URL(window.location.href);
      url.searchParams.set('modelId', model.id);
      return url.toString();
    }
  }, [model.id, githubConfig]);

  const handleShare = () => {
    navigator.clipboard.writeText(fullShareUrl).then(() => {
      setCopied(true);
      setShareUrl(fullShareUrl);
      setTimeout(() => {
        setCopied(false);
        setShareUrl(null);
      }, 3000); // Reset after 3 seconds
    });
  };

  return (
    <>
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
            <h3 className="text-lg font-bold text-white truncate">{model.title}</h3>
            {model.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{model.description}</p>}
          </div>
          <div className="mt-4">
             <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsARModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700/80 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
                    aria-label={`View ${model.title} in AR`}
                >
                    <ARIcon className="w-5 h-5 text-cyan-300" />
                    View in AR
                </button>
                <button 
                    onClick={handleShare}
                    className="flex-shrink-0 bg-slate-700/80 text-cyan-300 p-2 rounded-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
                    aria-label={`Share ${model.title}`}
                >
                    {copied ? (
                    <ClipboardCheckIcon className="w-5 h-5" />
                    ) : (
                    <ShareIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
            {shareUrl && (
              <div className="mt-2">
                <label htmlFor={`share-url-${model.id}`} className="sr-only">Shareable URL</label>
                <input
                  id={`share-url-${model.id}`}
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-1 text-xs text-slate-300 focus:ring-0 focus:border-cyan-500"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {isARModalOpen && (
        <ARQRCodeModal 
            arPageUrl={arPageUrl}
            modelTitle={model.title}
            onClose={() => setIsARModalOpen(false)} 
        />
      )}
    </>
  );
};

export default ModelCard;