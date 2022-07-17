export interface DirectoryEntry {
    name?: string,
    type?: EntryType,
    mode?: Permissions,
    size?: number,
    mtime?: Time,
    uid?: number,
    gid?: number,
    obj?: ObjectID,
    summ?: DirectorySummary
}

export interface DirectorySummary {
    size: number,
    files: number,
    symlinks: number,
    dirs: number,
    maxTime: Date,
    incomplete?: string,
    numFailed: number,
    numIgnoredErrors?: number,
    errors?: EntryWithError[]
}

export interface EntryWithError {
    path: string,
    error: string
}

export type Time = string | number | Date;

export type EntryType = string;

export interface Obj {

}

export interface InfoStruct {
    contentID: ObjectID,
    packFile?: string,
    time: string,
    originalLength: number,
    packedLength: number,
    packOffset?: number,
    deleted: boolean,
    formatVersion: number,
    compression?: HeaderID,
    encryptionKeyID?: number
}

export type HeaderID = 0x1000 | 0x1001 | 0x1002 | 0x1100 | 0x1101 | 0x1102 | 0x1103 | 0x1200 | 0x1201 | 0x1202 | 0x1203 | 0x1300 | 0x1301 | 0x1302 | 0x1400 | 0x1500 | 0x1501 | 0x1502;

export type ObjectID = string;

export interface SourceInfo {
    userName: string,
    host: string,
    path: string
}

export interface Task {
    id: string,
    status: string,
    startTime: Time,
    endTime?: Time
}

export enum TaskStatus {
    Running = "RUNNING",

    Success = "SUCCESS",
    Failed = "FAILED",
    Canceled = "CANCELED"
}

export interface Algorithms {
    compression: CompressionAlgorithm[],
    hash: HashAlgorithm[],
    encryption: EncryptionAlgorithm[],
    splitter: SplitterAlgorithm[],

    defaultEncryption: string,
    defaultHash: string,
    defaultSplitter: string,

    indexVersion?: string
}

export interface HashAlgorithm {
    id: string,
    deprecated: boolean
}

export interface EncryptionAlgorithm {
    id: string,
    deprecated: boolean
}

export interface CompressionAlgorithm {
    id: string,
    deprecated: boolean
}

export interface SplitterAlgorithm {
    id: string,
    deprecated: boolean
}
