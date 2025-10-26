import type { DetailedHTMLProps, HTMLAttributes, JSX as ReactJSX } from 'react';

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
    // Fix: Extend React's IntrinsicElements to include default HTML tags. The original
    // declaration was overwriting the default types, causing errors for all standard
    // HTML elements like <div>, <p>, etc.
    interface IntrinsicElements extends ReactJSX.IntrinsicElements {
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
