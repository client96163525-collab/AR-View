// FIX: Changed the React import to be type-only to resolve an issue where
// the global JSX namespace was being overwritten instead of augmented. This
// restores definitions for standard HTML elements.
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

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

// Augment the JSX.IntrinsicElements interface to include the <model-viewer> custom element.
// This allows TypeScript to recognize <model-viewer> as a valid JSX tag.
// FIX: Switched to `declare global` for module augmentation to resolve an issue
// where `declare module 'react'` was not being found. This approach correctly
// extends React's IntrinsicElements for custom elements.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
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
