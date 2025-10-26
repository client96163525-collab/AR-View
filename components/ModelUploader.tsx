import React, { useState, useRef, useCallback } from 'react';
import { ModelData, GitHubConfig } from '../types';
import { UploadIcon } from './icons';

interface ModelUploaderProps {
  onPublish: (model: Omit<ModelData, 'id'>) => void;
}

const ModelUploader: React.FC<ModelUploaderProps> = ({ onPublish }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((selectedFile: File | undefined) => {
    if (selectedFile) {
      const supportedFormats = ['.glb', '.gltf', '.usdz'];
      const fileExtension = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();

      if (supportedFormats.includes(fileExtension)) {
        if (selectedFile.size > 50 * 1024 * 1024) {
          setError('File is too large (> 50MB). Please upload a smaller model.');
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
        // The previewUrl is a data URL: "data:mime/type;base64,content"
        // We need to extract just the base64 content part.
        const base64Content = previewUrl.split(',')[1];
        if (!base64Content) {
            throw new Error("Could not extract file content.");
        }

        const uniqueFileName = `${Date.now()}-${file.name}`;
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

        const responseData = await response.json();
        const downloadUrl = responseData.content.download_url;

        if (!downloadUrl) {
            throw new Error("Could not get download URL from GitHub response.");
        }

        onPublish({ title, description, fileUrl: downloadUrl });

        // Reset form on success
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
  
  const handleDragEnter = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
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
            placeholder="A short description of your model."
          />
        </div>

        <div>
            <label 
                className={`flex justify-center w-full h-32 px-4 transition bg-slate-900 border-2 border-slate-700 border-dashed rounded-md appearance-none cursor-pointer hover:border-cyan-400 focus:outline-none ${isDragging ? 'border-cyan-400 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-800' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <span className="flex items-center space-x-2">
                    <UploadIcon className="w-6 h-6 text-slate-400"/>
                    <span className="font-medium text-slate-400 text-center">
                        {file ? `${file.name}` : `Drop file or click to upload`}
                        <span className="block text-slate-500 text-xs"> (.glb, .gltf, .usdz, max 50MB)</span>
                    </span>
                </span>
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
        
        {error && <p className="text-sm text-red-400">{error}</p>}

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