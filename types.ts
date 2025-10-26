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
  branch: string;
}

// Augment the JSX.IntrinsicElements interface to include the <model-viewer> custom element.
// This allows TypeScript to recognize <model-viewer> as a valid JSX tag.
declare global {
  namespace JSX {
    // Fix: The previous definition was incorrectly extending React's JSX.IntrinsicElements,
    // which overwrites the default types instead of augmenting them. The correct approach
    // is to re-declare the interface, allowing TypeScript's declaration merging to add
    // the custom 'model-viewer' element while preserving all standard HTML tags.
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<
        // Inherit all standard HTML attributes (e.g., style, className).
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
