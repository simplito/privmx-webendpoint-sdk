import { ContainerWithoutItemPolicy } from './core';
import { CreateContainerPayload, UpdateContainerPayload } from './generics';
import { PrivmxFile } from './store';

/**
 * Configuration settings for file uploads.
 */
export interface FilesConfig {
    /**
     * Min. number of files required.
     */
    minCount: number;

    /**
     * Max. number of files allowed.
     */
    maxCount: number;

    /**
     * Max. allowed size for a single file, in bytes.
     */
    maxFileSize: number;

    /**
     * Max. allowed size for the entire upload, in bytes.
     */
    maxWholeUploadSize: number;
}

/**
 * Represents a public view of an Inbox, including basic metadata.
 */
export interface InboxPublicView {
    /**
     * Unique identifier of the Inbox.
     */
    inboxId: string;

    /**
     * Version number of the Inbox, used for concurrency control.
     */
    version: number;

    /**
     * Public metadata associated with the Inbox, stored as a byte array.
     */
    publicMeta: Uint8Array;
}

/**
 * Information about Inbox
 */
export interface Inbox {
    /**
     * Unique identifier of the Inbox.
     */
    inboxId: string;

    /**
     * Unique identifier of the Context to which the Inbox belongs.
     */
    contextId: string;

    /**
     * The timestamp when the Inbox was created.
     */
    createDate: number;

    /**
     * ID of the user who created the Inbox.
     */
    creator: string;

    /**
     * The timestamp when the Inbox was last modified.
     */
    lastModificationDate: number;

    /**
     * ID of the user who last modified the Inbox.
     */
    lastModifier: string;

    /**
     * An array of user IDs who are participants in the Inbox.
     */
    users: string[];

    /**
     * An array of user IDs who manage the Inbox.
     */
    managers: string[];

    /**
     * The current version of the Inbox, used for concurrency control.
     */
    version: number;

    /**
     * Public metadata associated with the Inbox, stored as a byte array.
     */
    publicMeta: Uint8Array;

    /**
     * Private metadata associated with the Inbox, stored as a byte array.
     */
    privateMeta: Uint8Array;

    /**
     * Optional configuration settings for file uploads within the Inbox.
     */
    filesConfig?: FilesConfig;

    /**
     * Total number of entries in the Inbox.
     */
    statusCode: number;
}

/**
 * Represents an entry within an Inbox, including its content and associated files.
 */
export interface InboxEntry {
    /**
     * Unique identifier of the entry.
     */
    entryId: string;

    /**
     * Unique identifier of the Inbox to which this entry belongs.
     */
    inboxId: string;

    /**
     * The content of the entry, stored as a byte array.
     */
    data: Uint8Array;

    /**
     * An array of files associated with this entry.
     */
    files: PrivmxFile[];

    /**
     * The public key of the author who created the entry, used for verification.
     */
    authorPubKey: string;

    /**
     * The timestamp when the entry was created.
     */
    createDate: number;

    /**
     * The status code of the message, indicating its current state.
     */
    statusCode: number;
}

/// --- EVENTS ---

/**
 * Represents the data for an event where an Inbox is deleted.
 */
export interface InboxDeletedEventData {
    /**
     * Unique identifier of the deleted Inbox.
     */
    inboxId: string;
}

/**
 * Represents the data for an event where an entry within an Inbox is deleted.
 */
export interface InboxEntryDeletedEventData {
    /**
     * Unique identifier of the Inbox containing the deleted entry.
     */
    inboxId: string;

    /**
     * Unique identifier of the deleted entry within the Inbox.
     */
    entryId: string;
}

/**
 * Represents payload that is sent to an Inbox.
 */
export interface InboxEntryPayload {
    /**
     * Content of the entry.
     */
    data: Uint8Array;

    /**
     * Optional files associated with the entry.
     */
    files?: Array<{
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
        data: Uint8Array | File;
    }>;
}

export interface CreateInboxPayload extends CreateContainerPayload {
    filesConfig?: FilesConfig;
    policies?: ContainerWithoutItemPolicy;
}

export interface UpdateInboxPayload extends UpdateContainerPayload {
    filesConfig?: FilesConfig;
    policies?: ContainerWithoutItemPolicy;
}
