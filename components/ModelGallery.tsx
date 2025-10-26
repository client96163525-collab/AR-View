

import React from 'react';
import { ModelData, GitHubConfig } from '../types';
import ModelCard from './ModelCard';
import { CubeTransparentIcon, SearchIcon } from './icons';

interface ModelGalleryProps {
  models: ModelData[];
  githubConfig: GitHubConfig | null;
}

const ModelGallery: React.FC<ModelGalleryProps> = ({ models, githubConfig }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);


  const filteredModels = models.filter(model =>
    model.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Published Models</h2>
      </div>

      <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search models by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            aria-label="Search models"
          />
        </div>

      {models.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-slate-800/50 p-10 rounded-lg border-2 border-dashed border-slate-700">
          <CubeTransparentIcon className="w-16 h-16 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-300">No Models Yet</h3>
          <p className="text-slate-400 mt-2">Upload your first .glb model to see it here!</p>
        </div>
      ) : filteredModels.length === 0 && debouncedSearchTerm ? (
        <div className="flex flex-col items-center justify-center text-center bg-slate-800/50 p-10 rounded-lg">
          <SearchIcon className="w-16 h-16 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-300">No Models Found</h3>
          <p className="text-slate-400 mt-2">Your search for "{debouncedSearchTerm}" did not match any models.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredModels.map(model => (
            <ModelCard key={model.id} model={model} githubConfig={githubConfig} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelGallery;
