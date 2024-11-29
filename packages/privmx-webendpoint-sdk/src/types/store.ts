import { CreateContainerPayload, UpdateContainerPayload } from './generics';
import { ContainerPolicy } from './policy';

/**
 * Information about a file on the server.
 */
export interface ServerFileInfo {
    /**
     * Unique ID of the Store where the file is located.
     */
    storeId: string;

    /**
     * Unique ID of the file.
     */
    fileId: string;

    /**
     * Creation date of the file, represented as a timestamp.
     */
    createDate: number;

    /**
     * The author of the file.
     */
    author: string;
}
/**
 * Represents a file with associated metadata and status information.
 */
export interface PrivmxFile {
    /**
     * Information about the file from the server.
     */
    info: ServerFileInfo;

    /**
     * Public metadata associated with the file, represented as a Uint8Array.
     */
    publicMeta: Uint8Array;

    /**
     * Private metadata associated with the file, represented as a Uint8Array.
     */
    privateMeta: Uint8Array;

    /**
     * Size of the file in bytes.
     */
    size: number;

    /**
     * Public key of the author of the file.
     */
    authorPubKey: string;

    /**
     * Status code of the file. Set to 0 on success.
     */
    statusCode: number;
}

/**
 * Represents a Store with its metadata and file information.
 */
export interface Store {
    /**
     * Unique ID of the Store.
     */
    storeId: string;

    /**
     * Context ID of the Store.
     */
    contextId: string;

    /**
     * Creation date of the Store, represented as a timestamp.
     */
    createDate: number;

    /**
     * The creator of the Store.
     */
    creator: string;

    /**
     * Date of the last modification to the Store, represented as a timestamp.
     */
    lastModificationDate: number;

    /**
     * Date of the most recent file added to the Store, represented as a timestamp.
     */
    lastFileDate: number;

    /**
     * The last person who modified the Store.
     */
    lastModifier: string;

    /**
     * A list of users associated with the Store.
     */
    users: string[];

    /**
     * A list of managers associated with the Store.
     */
    managers: string[];

    /**
     * Version number of the Store.
     */
    version: number;

    /**
     * Private metadata associated with the Store, represented as a Uint8Array.
     */
    privateMeta: Uint8Array;

    /**
     * Public metadata associated with the Store, represented as a Uint8Array.
     */
    publicMeta: Uint8Array;

    /**
     * Number of files in the Store.
     */
    filesCount: number;
}

/**
 * Represents the data associated with a deleted Store event.
 */
export interface StoreDeletedEventData {
    /**
     * Unique ID of the deleted Store.
     */
    storeId: string;
}

/**
 * Represents the data associated with a change in Store statistics.
 */
export interface StoreStatsChangedEventData {
    /**
     * Context ID of the Store.
     */
    contextId: string;

    /**
     * Unique ID of the Store.
     */
    storeId: string;

    /**
     * Date of the most recent file added to the Store, represented as a timestamp.
     */
    lastFileDate: number;

    /**
     * Number of files in the Store.
     */
    files: number;
}

/**
 * Represents the data associated with a file deletion event in a Store.
 */
export interface StoreFileDeletedEventData {
    /**
     * Context ID of the Store.
     */
    contextId: string;

    /**
     * Unique ID of the Store.
     */
    storeId: string;

    /**
     * Unique ID of the deleted file.
     */
    fileId: string;
}

/**
 * Represents payload that is sent while uploading a file to a Store.
 */
export interface StoreFilePayload {
    /**
     *Optional, contains confidential data that will be encrypted before being sent to server.
     */
    privateMeta?: Uint8Array;

    /**
     *Optional, contains data that can be accessed by everyone and is not encrypted.
     */
    publicMeta?: Uint8Array;

    /**
     * Content of the file.
     */
    data: Uint8Array;
}

export interface CreateStorePayload extends CreateContainerPayload {
    policies?: ContainerPolicy;
}

export interface UpdateStorePayload extends UpdateContainerPayload {
    policies?: ContainerPolicy;
}
