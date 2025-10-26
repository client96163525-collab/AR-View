// FIX: Corrected React imports to resolve JSX type definition issues.
// Using a standard `import React from 'react'` ensures that TypeScript correctly
// merges the global `JSX.IntrinsicElements` interface from React with the
// custom element definition below, instead of overwriting it. This fixes
// errors related to unrecognized standard HTML tags (e.g., 'div', 'h1') in JSX.
import React from 'react';

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
