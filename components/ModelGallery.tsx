
import React from 'react';
import { ModelData } from '../types';
import ModelCard from './ModelCard';
import { CubeTransparentIcon } from './icons';

interface ModelGalleryProps {
  models: ModelData[];
}

const ModelGallery: React.FC<ModelGalleryProps> = ({ models }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-white">Published Models</h2>
      {models.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-slate-800/50 p-10 rounded-lg border-2 border-dashed border-slate-700">
          <CubeTransparentIcon className="w-16 h-16 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-300">No Models Yet</h3>
          <p className="text-slate-400 mt-2">Upload your first .glb model to see it here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map(model => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelGallery;
