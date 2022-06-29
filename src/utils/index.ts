declare global {
    interface KopiaUI {
        selectDirectory(callback: (selectedPath: string) => void): void
        browseDirectory(path: string): void
    }

    interface Window {
        kopiaUI?: KopiaUI;
    }
}

export * from './FsSize';
export * from './Rfc3339Timestamp';
export * from './GoBackButton';
export * from './TaskStatusSymbol';
export * from './CliEquivalent';
export * from './DirectorySelector';
export * from './functions';
