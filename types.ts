// FIX: Use a type-only import to prevent module scope issues with global JSX augmentation.
import type React from 'react';

export interface ModelData {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  pat: string;
  branch:string;
  publicUrl?: string;
}

// FIX: Using `declare global` to augment the global JSX namespace.
// This allows TypeScript to recognize the custom <model-viewer> element as a valid JSX tag
// without causing module resolution issues with 'react'.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        // Define custom attributes specific to <model-viewer>.
        src?: string;
        alt?: string;
        ar?: boolean;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
      };
    }
  }
}
