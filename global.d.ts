// Extend the Window interface to include the kopiaUI property
declare interface Window {
  kopiaUI?: {
    selectDirectory?: (callback: (path: string) => void) => void;
    browseDirectory?;
  };
}
