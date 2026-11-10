import type { AgentFlowClient } from './client.js';
import type { CursorPage } from './cursor-list.js';
import type { components } from './generated/public.js';
type Schemas = components['schemas'];
/** What one unit of work is when a file field is given a folder, as a workflow's input contract says it per field. */
export type SlotFolder = Schemas['SlotFolder'];
export type WatchedFolder = Schemas['WatchedFolder'];
export type Subfolder = Schemas['WatchedSubfolder'];
export type FolderPreview = Schemas['FolderLaunchPreview'];
/** A declared file the server will not store, and why (`FILE_TOO_LARGE`). */
export type RefusedFile = Schemas['UploadSetRefusedFile'];
/**
 * The value a launch takes for a file field bound to a folder: a watched folder or an upload set, and optionally one folder
 * inside a watched folder. The API refuses any other key.
 */
export interface FileSetEnvelope {
    $fileSet: string;
    /** A folder inside a watched folder, as a path from its root: the run takes only what is under it. */
    path?: string;
}
export declare function fileSetEnvelope(fileSetId: string, path?: string): FileSetEnvelope;
export interface UploadProgress {
    /** Files of the set that are stored, counting those stored before a resumed upload began. */
    stored: number;
    /** Files the set will hold: those declared, less those the server refused. */
    total: number;
}
export interface UploadOptions {
    /** What the person calls the set, at most 200 characters. */
    name: string;
    /**
     * An upload set an earlier, interrupted upload announced. When the files given now are exactly the ones it declared, by path
     * and size, only those not yet stored are uploaded. Otherwise that set is deleted and the upload starts as a new one.
     */
    resumeSetId?: string;
    /** Called with a new set's id as soon as it exists, before any file is uploaded: keep it to resume after a reload. */
    onSetCreated?: (setId: string) => void;
    onProgress?: (progress: UploadProgress) => void;
    /** Aborting stops the upload, and deletes the set when this call created it. */
    signal?: AbortSignal;
}
export interface UploadResult {
    /** The value to launch with: the completed upload set. */
    value: FileSetEnvelope;
    /** The files left out of the set, which is complete without them. */
    refused: RefusedFile[];
}
export interface FolderSources {
    /** The watched folders the caller may use. */
    watched(): Promise<WatchedFolder[]>;
    /** The folders directly inside a watched folder, or inside the folder at `path`, a page at a time in name order. */
    subfolders(setId: string, path?: string, cursor?: string | null): Promise<CursorPage<Subfolder>>;
    /** What a launch binding `value` to a field of the workflow's start form would take, without starting anything. */
    preview(workflowId: string, field: string, value: FileSetEnvelope, versionId?: string): Promise<FolderPreview>;
    /**
     * Uploads a folder from the person's computer into an upload set, each file at its path inside the folder. The folder's own
     * name is not part of a path, so the folders directly inside it are the first level a launch groups by.
     *
     * `files` is what a folder input (`webkitdirectory`) selected, or the entries of a drop
     * (`DataTransferItem.webkitGetAsEntry()`). Several entries dropped together keep their own names as the first level.
     * Dropped entries are read a few at a time, and the files keep the order their directories list them in.
     *
     * The files an operating system keeps in a folder for itself are left out at any depth: `.DS_Store`, `Thumbs.db` and
     * `desktop.ini`, whatever the case of the name.
     *
     * An upload that fails leaves its set in place to be resumed with `resumeSetId`.
     */
    uploadFolder(files: File[] | FileSystemEntry[], opts: UploadOptions): Promise<UploadResult>;
    /**
     * Uploads plain files into an upload set as one folder, `files/`, so a launch reads them as it reads a folder of files.
     * A name given more than once keeps the first as it is and numbers the later ones before the extension, in the order given,
     * skipping any number another file's name already has: `scan.pdf`, `scan (2).pdf`, `scan (3).pdf`.
     */
    uploadFiles(files: File[], opts: UploadOptions): Promise<UploadResult>;
    /** Deletes an upload set and the files stored in it, which frees one of the person's few unfinished sets. */
    deleteSet(setId: string): Promise<void>;
}
/** Sources of the folders a launch can take: the organization's watched folders, and folders or files from the person's computer. */
export declare function folderSources(client: AgentFlowClient): FolderSources;
export {};
//# sourceMappingURL=folders.d.ts.map