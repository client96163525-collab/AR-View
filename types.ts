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

// FIX: Replaced `declare global` with `declare module 'react'` to correctly augment
// React's JSX types instead of overwriting them. This resolves all errors
// indicating that standard HTML elements like 'div' do not exist on type 'JSX.IntrinsicElements'.
// This allows TypeScript to recognize the custom <model-viewer> element as a valid JSX tag.
declare module 'react' {
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
