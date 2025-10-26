
// FIX: Switched to namespace import for React to solve JSX intrinsic element type errors.
import * as React from 'react';
import { GitHubConfig } from '../types';
import { UploadIcon, ExclamationTriangleIcon, ClipboardCheckIcon } from './icons';

interface ModelUploaderProps {
  onPublish: () => void;
}

const ModelUploader: React.FC<ModelUploaderProps> = ({ onPublish }) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processFile = React.useCallback((selectedFile: File | undefined) => {
    if (selectedFile) {
      const supportedFormats = ['.glb', '.gltf', '.usdz'];
      const fileExtension = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();

      if (supportedFormats.includes(fileExtension)) {
        if (selectedFile.size > 50 * 1024 * 1024) {
          setError('File size exceeds the 50MB limit. Please optimize your model and try again.');
          setFile(null);
          setPreviewUrl(null);
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setFile(selectedFile);
          setPreviewUrl(dataUrl);
          setError(null);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2000);
        };
        reader.onerror = () => {
          setError('Failed to read the file. Please try again.');
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setError('Please upload a valid .glb, .gltf, or .usdz file.');
        setFile(null);
        setPreviewUrl(null);
      }
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    processFile(selectedFile);
  };

  const handlePublishClick = async () => {
    if (!file || !previewUrl || !title.trim()) {
      setError('Please provide a title and a supported model file to publish.');
      return;
    }

    const configStr = localStorage.getItem('github-config');
    if (!configStr) {
        setError('GitHub settings are not configured. Please configure them via the settings icon in the header.');
        return;
    }
    const config: GitHubConfig = JSON.parse(configStr);
    
    setIsUploading(true);
    setError(null);

    try {
        const base64Content = previewUrl.split(',')[1];
        if (!base64Content) {
            throw new Error("Could not extract file content.");
        }

        const uniqueFileName = `${Date.now()}-${file.name.replace(/ /g, '_')}`;
        const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/models/${uniqueFileName}`;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${config.pat}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `feat: add 3D model '${uniqueFileName}'`,
                content: base64Content,
                branch: config.branch || 'main'
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API Error: ${errorData.message || 'Failed to upload.'}`);
        }

        onPublish();

        setTitle('');
        setDescription('');
        setFile(null);
        setPreviewUrl(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    } catch (err: any) {
        console.error(err);
        if (err.message?.includes('Not Found')) {
            setError('Upload failed: GitHub returned "Not Found". Please check your settings: owner, repository name, and branch must be correct. For private repos, your PAT needs "repo" scope.');
        } else {
            setError(`Upload failed: ${err.message}`);
        }
    } finally {
        setIsUploading(false);
    }
  };
  
  const handleDragEnter = React.useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = React.useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = React.useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = React.useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    processFile(droppedFile);
  }, [processFile]);

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg sticky top-24">
      <h2 className="text-xl font-bold mb-4 text-white">Upload Your Model</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
            Model Title <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            placeholder="e.g., Sci-Fi Rover"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            placeholder="This will not be saved to GitHub, only used for search."
          />
        </div>

        <div>
            <label 
                className={`flex flex-col justify-center items-center w-full h-32 px-4 transition bg-slate-900 border-2 border-dashed rounded-md appearance-none cursor-pointer focus:outline-none ${
                    isDragging 
                        ? 'border-cyan-400 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-800' 
                        : uploadSuccess 
                        ? 'border-green-500' 
                        : file
                        ? 'border-cyan-600'
                        : 'border-slate-700 hover:border-cyan-400'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {isDragging ? (
                    <div className="text-center pointer-events-none">
                        <UploadIcon className="w-10 h-10 text-cyan-400 mx-auto" />
                        <p className="mt-2 font-semibold text-cyan-400">Drop Your Model Here</p>
                    </div>
                ) : uploadSuccess ? (
                     <div className="text-center pointer-events-none">
                        <ClipboardCheckIcon className="w-10 h-10 text-green-400 mx-auto" />
                        <p className="mt-2 font-semibold text-green-400">Model Ready for Preview</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <UploadIcon className="w-8 h-8 text-slate-400 mx-auto mb-2"/>
                        <p className="font-medium text-slate-400">
                            {file ? `${file.name}` : `Drop file or click to upload`}
                        </p>
                        <p className="text-slate-500 text-xs"> (.glb, .gltf, .usdz, max 50MB)</p>
                    </div>
                )}
                <input 
                    type="file" 
                    name="file_upload" 
                    className="hidden"
                    accept=".glb,.gltf,.usdz"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                />
            </label>
        </div>

        {previewUrl && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-slate-200">Live Preview</h3>
            <div className="w-full h-64 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden">
               <model-viewer
                src={previewUrl}
                alt={title || "3D model preview"}
                ar
                camera-controls
                auto-rotate
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-md p-3 flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handlePublishClick}
          disabled={!file || !title || isUploading}
          className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400 flex items-center justify-center"
        >
          {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing to GitHub...
              </>
          ) : 'Publish Model'}
        </button>
      </div>
    </div>
  );
};

export default ModelUploader;