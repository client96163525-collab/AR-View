import React, { type DetailedHTMLProps, type HTMLAttributes } from 'react';

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
}

// Augment the JSX.IntrinsicElements interface to include the <model-viewer> custom element.
// This allows TypeScript to recognize <model-viewer> as a valid JSX tag.
declare global {
  namespace JSX {
    // FIX: The previous use of `extends React.JSX.IntrinsicElements` was incorrect, as it
    // replaced the original definition from @types/react instead of augmenting it. This caused
    // TypeScript to not recognize standard HTML elements. The correct approach is to rely on
    // TypeScript's declaration merging to add our custom element to the existing interface.
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
