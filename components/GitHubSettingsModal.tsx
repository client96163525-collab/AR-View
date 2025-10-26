
// FIX: Switched to namespace import for React to solve JSX intrinsic element type errors.
import * as React from 'react';
import { GitHubConfig } from '../types';
import { CloseIcon, GitHubIcon } from './icons';

interface GitHubSettingsModalProps {
  onClose: () => void;
  onSave: (config: GitHubConfig) => void;
  currentConfig: GitHubConfig | null;
}

const GitHubSettingsModal: React.FC<GitHubSettingsModalProps> = ({ onClose, onSave, currentConfig }) => {
  const [owner, setOwner] = React.useState('client96163525-collab');
  const [repo, setRepo] = React.useState('AR-View');
  const [pat, setPat] = React.useState('');
  const [branch, setBranch] = React.useState('main');
  const [publicUrl, setPublicUrl] = React.useState('');
  const [error, setError] = React.useState('');
  
  React.useEffect(() => {
    if (currentConfig) {
      setOwner(currentConfig.owner);
      setRepo(currentConfig.repo);
      setPat(currentConfig.pat);
      setBranch(currentConfig.branch || 'main');
      setPublicUrl(currentConfig.publicUrl || '');
    }
  }, [currentConfig]);

  const handleSave = () => {
    setError(''); // Reset error state on each attempt

    if (!owner.trim() || !repo.trim() || !pat.trim() || !branch.trim()) {
      setError('Owner, Repo, PAT, and Branch fields are required.');
      return;
    }

    if (!pat.trim().startsWith('ghp_') && !pat.trim().startsWith('github_pat_')) {
      setError("Invalid PAT format. A Personal Access Token must start with 'ghp_' (classic) or 'github_pat_' (fine-grained).");
      return;
    }

    onSave({ owner, repo, pat, branch, publicUrl });
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
        
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
                placeholder="ghp_... or github_pat_..."
              />
            </div>

            <div>
              <label htmlFor="publicUrl" className="block text-sm font-medium text-slate-300 mb-1">
                Public Application URL (Optional)
              </label>
              <input
                id="publicUrl"
                type="url"
                value={publicUrl}
                onChange={(e) => setPublicUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder="https://your-username.github.io/AR-View/"
              />
               <p className="text-xs text-slate-500 mt-1">
                Enter the URL where this app is deployed. This is needed for QR codes and sharing links to work correctly.
              </p>
            </div>

            <div className="bg-red-900/50 border border-red-700 text-red-300 text-xs rounded-md p-3">
                <p className="font-bold">Security Warning & PAT Info</p>
                <p className="mt-1">
                    Your PAT is stored in your browser's local storage. For security, use a token with only the necessary `repo` permissions.
                    <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-200 ml-1">
                       Learn how to create a PAT.
                    </a>
                </p>
                 <p className="mt-2">
                    A valid token should start with <strong>ghp_</strong> (classic) or <strong>github_pat_</strong> (fine-grained).
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