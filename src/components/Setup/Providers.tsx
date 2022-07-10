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
import { Component } from "react";

export interface Provider {
    name: string,
    description: string,
    isInternal: boolean,
    component: typeof Component
}

export const supportedProviders: Provider[] = [
    { name: "filesystem", description: "Local Directory or NAS", isInternal: false, component: SetupFilesystem },
    { name: "gcs", description: "Google Cloud Storage", isInternal: false, component: SetupGCS },
    { name: "s3", description: "Amazon S3 or Compatible Storage", isInternal: false, component: SetupS3 },
    { name: "b2", description: "Backblaze B2", isInternal: false, component: SetupB2 },
    { name: "azureBlob", description: "Azure Blob Storage", isInternal: false, component: SetupAzure },
    { name: "sftp", description: "SFTP Server", isInternal: false, component: SetupSFTP },
    { name: "rclone", description: "Rclone Remote", isInternal: false, component: SetupRclone },
    { name: "webdav", description: "WebDAV Server", isInternal: false, component: SetupWebDAV },
    { name: "_server", description: "Kopia Repository Server", isInternal: true, component: SetupKopiaServer },
    { name: "_token", description: "Use Repository Token", isInternal: true, component: SetupToken },
];