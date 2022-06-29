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

export enum HeaderID {
    headerGzipDefault = 0x1000,
    headerGzipBestSpeed = 0x1001,
    headerGzipBestCompression = 0x1002,

    HeaderZstdDefault = 0x1100,
    HeaderZstdFastest = 0x1101,
    HeaderZstdBetterCompression = 0x1102,
    HeaderZstdBestCompression = 0x1103,

    headerS2Default = 0x1200,
    headerS2Better = 0x1201,
    headerS2Parallel4 = 0x1202,
    headerS2Parallel8 = 0x1203,

    headerPgzipDefault = 0x1300,
    headerPgzipBestSpeed = 0x1301,
    headerPgzipBestCompression = 0x1302,

    headerLZ4Default = 0x1400,

    headerDeflateDefault = 0x1500,
    headerDeflateBestSpeed = 0x1501,
    headerDeflateBestCompression = 0x1502,
}

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
    endTime: Time
}
