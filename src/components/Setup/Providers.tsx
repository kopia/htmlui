import { SetupFilesystem } from "./SetupFilesystem";
import { SetupGCS } from "./SetupGCS";
import { SetupS3 } from "./SetupS3";
import { SetupAzure } from './SetupAzure';
import { SetupB2 } from "./SetupB2";
import { SetupKopiaServer } from './SetupKopiaServer';
import { SetupRclone } from './SetupRclone';
import { SetupSFTP } from './SetupSFTP';
import { SetupToken } from './SetupToken';
import { SetupWebDAV } from './SetupWebDAV';

export interface Provider {
    name: string,
    description: string,
    isInternal: boolean,
    render: (self: Provider) => JSX.Element
}

export const supportedProviders: Provider[] = [
    { name: "filesystem", description: "Local Directory or NAS", isInternal: false, render: (self) => <SetupFilesystem provider={self} /> },
    { name: "gcs", description: "Google Cloud Storage", isInternal: false, render: (self) => <SetupGCS /> },
    { name: "s3", description: "Amazon S3 or Compatible Storage", isInternal: false, render: (self) => <SetupS3 /> },
    { name: "b2", description: "Backblaze B2", isInternal: false, render: (self) => <SetupB2 /> },
    { name: "azureBlob", description: "Azure Blob Storage", isInternal: false, render: (self) => <SetupAzure /> },
    { name: "sftp", description: "SFTP Server", isInternal: false, render: (self) => <SetupSFTP /> },
    { name: "rclone", description: "Rclone Remote", isInternal: false, render: (self) => <SetupRclone /> },
    { name: "webdav", description: "WebDAV Server", isInternal: false, render: (self) => <SetupWebDAV /> },
    { name: "_server", description: "Kopia Repository Server", isInternal: true, render: (self) => <SetupKopiaServer provider={self} /> },
    { name: "_token", description: "Use Repository Token", isInternal: true, render: (self) => <SetupToken provider={self} /> },
];