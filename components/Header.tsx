
// FIX: Switched to namespace import for React to solve JSX intrinsic element type errors.
import * as React from 'react';
import { CubeIcon, CogIcon } from './icons';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <CubeIcon className="h-8 w-8 text-cyan-400" />
            <div>
                <h1 className="text-2xl font-bold text-white">3D Model Showcase</h1>
                <p className="text-sm text-slate-400">Upload, view, and share your 3D models.</p>
            </div>
        </div>
        <button 
          onClick={onSettingsClick}
          aria-label="Open settings"
          className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
            <CogIcon className="w-6 h-6 text-slate-300" />
        </button>
      </div>
    </header>
  );
};

export default Header;