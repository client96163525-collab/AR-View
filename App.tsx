import React, { useState, useEffect } from 'react';
import { ModelData, GitHubConfig } from './types';
import Header from './components/Header';
import ModelUploader from './components/ModelUploader';
import ModelGallery from './components/ModelGallery';
import FullScreenModelViewer from './components/FullScreenModelViewer';
import GitHubSettingsModal from './components/GitHubSettingsModal';

const App: React.FC = () => {
  const [models, setModels] = useState<ModelData[]>(() => {
    try {
      const storedModels = localStorage.getItem('glb-models');
      return storedModels ? JSON.parse(storedModels) : [];
    } catch (error) {
      console.error("Failed to parse models from localStorage", error);
      return [];
    }
  });

  const [currentModelId, setCurrentModelId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [githubConfig, setGithubConfig] = useState<GitHubConfig | null>(() => {
    try {
      const storedConfig = localStorage.getItem('github-config');
      return storedConfig ? JSON.parse(storedConfig) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('glb-models', JSON.stringify(models));
  }, [models]);

  useEffect(() => {
    const handleUrlChange = () => {
      const searchParams = new URLSearchParams(window.location.search);
      setCurrentModelId(searchParams.get('modelId'));
    };

    window.addEventListener('popstate', handleUrlChange);
    handleUrlChange(); // Initial check

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);
  
  // Prompt user to configure if they haven't yet
  useEffect(() => {
    if (!githubConfig) {
      setIsSettingsOpen(true);
    }
  }, [githubConfig]);

  const handlePublish = (newModel: Omit<ModelData, 'id'>) => {
    setModels(prevModels => [
      { ...newModel, id: Date.now().toString() },
      ...prevModels,
    ]);
  };

  const handleSaveSettings = (config: GitHubConfig) => {
    setGithubConfig(config);
    localStorage.setItem('github-config', JSON.stringify(config));
    setIsSettingsOpen(false);
  };

  const modelToShow = currentModelId ? models.find(m => m.id === currentModelId) : null;

  const handleCloseViewer = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('modelId');
    window.history.pushState({}, '', url.toString());
    setCurrentModelId(null);
  };

  if (modelToShow) {
    return <FullScreenModelViewer model={modelToShow} onClose={handleCloseViewer} />;
  }

  if (currentModelId && !modelToShow) {
    return (
        <div className="min-h-screen bg-slate-900 font-sans flex items-center justify-center text-center p-4">
            <div>
                <h1 className="text-4xl font-bold text-white mb-4">Model Not Found</h1>
                <p className="text-slate-400 mb-8">The model you are looking for does not exist or has been removed.</p>
                <a
                    href={window.location.pathname}
                    onClick={(e) => {
                        e.preventDefault();
                        handleCloseViewer();
                    }}
                    className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-md hover:bg-cyan-500 transition-colors"
                >
                    Back to Gallery
                </a>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      {isSettingsOpen && (
        <GitHubSettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveSettings}
          currentConfig={githubConfig}
        />
      )}
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ModelUploader onPublish={handlePublish} />
          </div>
          <div className="lg:col-span-2">
            <ModelGallery models={models} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
