
import React, { useState, useEffect } from 'react';
import { GitHubConfig } from '../types';
import { CloseIcon, GitHubIcon } from './icons';

interface GitHubSettingsModalProps {
  onClose: () => void;
  onSave: (config: GitHubConfig) => void;
  currentConfig: GitHubConfig | null;
}

const GitHubSettingsModal: React.FC<GitHubSettingsModalProps> = ({ onClose, onSave, currentConfig }) => {
  const [owner, setOwner] = useState('client96163525-collab');
  const [repo, setRepo] = useState('ar3dview');
  const [pat, setPat] = useState('');
  const [branch, setBranch] = useState('main');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (currentConfig) {
      setOwner(currentConfig.owner);
      setRepo(currentConfig.repo);
      setPat(currentConfig.pat);
      setBranch(currentConfig.branch || 'main');
    }
  }, [currentConfig]);

  const handleSave = () => {
    if (!owner.trim() || !repo.trim() || !pat.trim() || !branch.trim()) {
      setError('All fields are required.');
      return;
    }
    onSave({ owner, repo, pat, branch });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md relative border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <GitHubIcon className="w-6 h-6 text-white"/>
            <h2 className="text-lg font-bold text-white">GitHub Configuration</h2>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close settings"
            className="p-1 rounded-full hover:bg-slate-700 transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
            <p className="text-sm text-slate-400">
                Provide your GitHub details to host the models. A new file will be committed to the specified branch inside a <strong>/models</strong> folder. The folder will be created if it doesn't exist.
            </p>
            <div>
              <label htmlFor="owner" className="block text-sm font-medium text-slate-300 mb-1">
                GitHub Username / Owner <span className="text-red-400">*</span>
              </label>
              <input
                id="owner"
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder="e.g., your-username"
              />
            </div>

            <div>
              <label htmlFor="repo" className="block text-sm font-medium text-slate-300 mb-1">
                Repository Name <span className="text-red-400">*</span>
              </label>
              <input
                id="repo"
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder="e.g., 3d-models-repo"
              />
            </div>

            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-slate-300 mb-1">
                Branch Name <span className="text-red-400">*</span>
              </label>
              <input
                id="branch"
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder="e.g., main or master"
              />
            </div>
            
            <div>
              <label htmlFor="pat" className="block text-sm font-medium text-slate-300 mb-1">
                Personal Access Token (PAT) <span className="text-red-400">*</span>
              </label>
              <input
                id="pat"
                type="password"
                value={pat}
                onChange={(e) => setPat(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder="ghp_..."
              />
            </div>

            <div className="bg-red-900/50 border border-red-700 text-red-300 text-xs rounded-md p-3">
                <p className="font-bold">Security Warning</p>
                <p className="mt-1">
                    Pasting your Personal Access Token here stores it in your browser. Use a token with only the necessary `repo` permissions. 
                    <a href="https://github.com/settings/tokens/new?scopes=repo&description=3DModelShowcase" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-200 ml-1">
                       Create a secure token.
                    </a>
                </p>
            </div>
            
            {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
            <button
                onClick={onClose}
                className="bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-md hover:bg-slate-600 transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors"
            >
                Save Settings
            </button>
        </div>
      </div>
    </div>
  );
};

export default GitHubSettingsModal;