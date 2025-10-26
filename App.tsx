import React from 'react';
import { ModelData, GitHubConfig } from './types';
import Header from './components/Header';
import ModelUploader from './components/ModelUploader';
import ModelGallery from './components/ModelGallery';
import FullScreenModelViewer from './components/FullScreenModelViewer';
import GitHubSettingsModal from './components/GitHubSettingsModal';
import PasswordProtection from './components/PasswordProtection';
import { CubeTransparentIcon, ExclamationTriangleIcon, ARIcon } from './components/icons';


const ARViewer: React.FC = () => {
  const [modelUrl, setModelUrl] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState<string>('3D Model');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('modelUrl');
    if (url) {
      try {
        // Basic validation that the URL is well-formed
        new URL(url);
        setModelUrl(url);
      } catch (e) {
        setError('Invalid model URL provided.');
      }
    } else {
      setError('No model URL provided.');
    }
    setTitle(params.get('title') || '3D Model');
  }, []);

  if (error) {
    return (
      <div className="w-screen h-screen bg-slate-900 text-white flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-red-400">Error</h1>
        <p className="text-slate-300 mt-2">{error}</p>
        <a href={window.location.pathname} className="mt-6 bg-cyan-600 text-white font-bold py-2 px-6 rounded-md hover:bg-cyan-500 transition-colors">
          Back to Gallery
        </a>
      </div>
    );
  }

  if (!modelUrl) {
    return (
      <div className="w-screen h-screen bg-slate-900 text-white flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900">
      <model-viewer
        src={modelUrl}
        alt={title}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        style={{ width: '100%', height: '100%', '--progress-bar-color': '#22d3ee' }}
      >
        <div className="absolute top-0 left-0 p-4 w-full bg-gradient-to-b from-black/50 to-transparent">
            <h1 className="text-xl font-bold text-white truncate">{title}</h1>
        </div>
        <button
          slot="ar-button"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-cyan-600 text-white font-bold py-3 px-6 rounded-full flex items-center gap-3 hover:bg-cyan-500 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
        >
          <ARIcon className="w-6 h-6" />
          <span>View in AR</span>
        </button>
      </model-viewer>
    </div>
  );
};


const App: React.FC = () => {
  // Check for AR mode first, as it's a separate, self-contained view.
  const isARView = new URLSearchParams(window.location.search).has('ar');
  if (isARView) {
    return <ARViewer />;
  }

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [models, setModels] = React.useState<ModelData[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [currentModelId, setCurrentModelId] = React.useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [githubConfig, setGithubConfig] = React.useState<GitHubConfig | null>(() => {
    try {
      const storedConfig = localStorage.getItem('github-config');
      return storedConfig ? JSON.parse(storedConfig) : null;
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    const sessionAuth = sessionStorage.getItem('app-authenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchModelsFromRepo = React.useCallback(async (config: GitHubConfig) => {
    if (!config || !config.owner || !config.repo) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setModels([]);
    setApiError(null);

    try {
      const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/models`;
      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(config.pat && { Authorization: `token ${config.pat}` }),
        },
      });

      if (response.status === 404) {
        console.log("'/models' directory not found. This is normal for a new setup and will be created on first upload.");
        setModels([]);
        return;
      }
       if (response.status === 401) {
        throw new Error('GitHub API Error (401 Unauthorized): Your Personal Access Token is incorrect or has expired. Please verify it in the settings.');
      }
      if (response.status === 403) {
        throw new Error('GitHub API Error (403 Forbidden): Your Personal Access Token may not have the required "repo" scope, or you may have hit a rate limit. Please check your token permissions.');
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Could not parse error response.' }));
        throw new Error(`GitHub API Error (${response.status}): ${errorData.message || 'Failed to fetch models.'}`);
      }

      const contents: any = await response.json();
      
      if (!Array.isArray(contents)) {
        console.warn("GitHub API did not return an array for the /models directory. This can happen if '/models' is a file, not a directory.", contents);
        setModels([]);
        return;
      }

      const modelFiles = contents.filter(item => item.name.endsWith('.glb') || item.name.endsWith('.gltf') || item.name.endsWith('.usdz'));

      const fetchedModels: ModelData[] = modelFiles.map(file => {
        const title = file.name
          .replace(/^\d+-/, '')
          .replace(/\.(glb|gltf|usdz)$/, '')
          .replace(/_/g, ' ')
          .replace(/-/g, ' ');

        return {
          id: file.sha,
          title: title,
          description: ``,
          fileUrl: file.download_url,
        };
      }).reverse();

      setModels(fetchedModels);

    } catch (error: any) {
      console.error("Failed to fetch models from GitHub", error);
      setApiError(error.message || 'An unexpected error occurred while fetching models.');
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isAuthenticated && githubConfig) {
      fetchModelsFromRepo(githubConfig);
    } else if (isAuthenticated) {
      setIsLoading(false);
    }
  }, [githubConfig, fetchModelsFromRepo, isAuthenticated]);


  React.useEffect(() => {
    const handleUrlChange = () => {
      const searchParams = new URLSearchParams(window.location.search);
      setCurrentModelId(searchParams.get('modelId'));
    };

    window.addEventListener('popstate', handleUrlChange);
    handleUrlChange();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);
  
  React.useEffect(() => {
    if (isAuthenticated && !githubConfig) {
      setIsSettingsOpen(true);
    }
  }, [githubConfig, isAuthenticated]);
  
  const handleCorrectPassword = () => {
    sessionStorage.setItem('app-authenticated', 'true');
    setIsAuthenticated(true);
  };

  const handlePublish = () => {
    if (githubConfig) {
      setTimeout(() => fetchModelsFromRepo(githubConfig), 1000);
    }
  };

  const handleSaveSettings = (config: GitHubConfig) => {
    setGithubConfig(config);
    localStorage.setItem('github-config', JSON.stringify(config));
    setIsSettingsOpen(false);
  };

  if (!isAuthenticated) {
    return <PasswordProtection onCorrectPassword={handleCorrectPassword} />;
  }

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

  if (currentModelId && !modelToShow && !isLoading) {
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

  const renderGalleryContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center bg-slate-800/50 p-10 rounded-lg">
            <svg className="animate-spin h-12 w-12 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="text-xl font-semibold text-slate-300">Loading Models...</h3>
            <p className="text-slate-400 mt-2">Fetching the latest from your GitHub repo.</p>
        </div>
      );
    }
    
    if (apiError) {
      return (
        <div className="flex flex-col items-center justify-center text-center bg-red-900/50 p-10 rounded-lg border-2 border-dashed border-red-700">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-red-200">Failed to Load Models</h3>
          <p className="text-red-300 mt-2 max-w-xl">{apiError}</p>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="mt-6 bg-slate-700 text-white font-bold py-2 px-6 rounded-md hover:bg-slate-600 transition-colors"
          >
            Check GitHub Settings
          </button>
        </div>
      );
    }

    if (!githubConfig) {
      return (
        <div className="flex flex-col items-center justify-center text-center bg-slate-800/50 p-10 rounded-lg border-2 border-dashed border-slate-700">
          <CubeTransparentIcon className="w-16 h-16 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-300">Configuration Needed</h3>
          <p className="text-slate-400 mt-2">Please set up your GitHub repository in the settings to see your models.</p>
        </div>
      );
    }

    return <ModelGallery models={models} githubConfig={githubConfig} />;
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
            {renderGalleryContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;