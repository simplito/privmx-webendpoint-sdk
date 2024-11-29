import {
    FilesConfig,
    Inbox,
    InboxEntry,
    InboxPublicView,
    PagingList,
    PagingQuery,
    UserWithPubKey
} from '../../types';
import { ContainerWithoutItemPolicy } from '../../types/policy';

export interface InboxApiInterface {
    /**
     * Creates a new Inbox.
     * @param {string} contextId - ID of the Context for the new Inbox
     * @param {UserWithPubKey[]} users - list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access to the created Inbox
     * @param {UserWithPubKey[]} managers - list of {@link UserWithPubKey `UserWithPubKey`} objects  which indicates who will have access (and management rights) to the created Inbox
     * @param {Uint8Array} publicMeta - (unencrypted) public Inbox metadata
     * @param {Uint8Array} privateMeta - (encrypted) private Inbox metadata
     * @param {FilesConfig} filesConfig object to override default file configuration,
     * @param {ContainerWithoutItemPolicy} policies Inbox policies
     * @returns {string} Created Inbox ID
     */
    createInbox: (
        contextId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        filesConfig: FilesConfig | undefined,
        policies?: ContainerWithoutItemPolicy
    ) => Promise<string>;

    /**
     * Updates an existing Inbox.
     * @param {string} inboxId ID of the Inbox to update
     * @param {UserWithPubKey[]} users list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access to the updated Inbox
     * @param {UserWithPubKey[]} managers list of {@link UserWithPubKey `UserWithPubKey`} objects  which indicates who will have access (and management rights) to the updated Inbox
     * @param {Uint8Array} publicMeta - (unencrypted) public Inbox metadata
     * @param {Uint8Array} privateMeta - (encrypted) private Inbox metadata
     * @param {FilesConfig | undefined} filesConfig object to override default file configuration. Provide undefined if you want to leave the default configuration.
     * @param {number} version current version of the updated Inbox
     * @param {boolean} force  force update (without checking version)
     * @param {boolean} forceGenerateNewKey force to regenerate a key for the Inbox,
     * @param {ContainerWithoutItemPolicy} policies Inbox policies
     * @returns void
     */
    updateInbox: (
        inboxId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        filesConfig: FilesConfig | undefined,
        version: number,
        force: boolean,
        forceGenerateNewKey: boolean,
        policies?: ContainerWithoutItemPolicy
    ) => Promise<void>;

    /**
     * Gets a single Inbox by Inbox ID given.
     * @param {string} inboxId - ID of the Inbox to get
     * @returns {Promise<Inbox>} {@link Inbox `Promise<Inbox>`} object containing information about Inbox.
     */
    getInbox: (inboxId: string) => Promise<Inbox>;

    /**
     * List Inboxes from given Context
     * @param contextId - ID of the Context to get the Inboxes from
     * @param {PagingQuery} {@link PagingQuery `PagingQuery`} object
     * @returns {Promise<PagingList<Inbox>>} {@link PagingList `Promise<PagingList<Inbox>>`}
     */
    listInboxes: (contextId: string, query: PagingQuery) => Promise<PagingList<Inbox>>;

    /**
     * Gets the public data of a given Inbox. You do not have to be logged in to call this function.
     * @param {string} inboxId ID of the Inbox to get
     * @returns {InboxPublicView} {@link InboxPublicView} containing public accessible information about Inbox.
     */

    getInboxPublicView: (inboxId: string) => Promise<InboxPublicView>;
    /**
     * Deletes a Inbox by a given Inbox ID.
     * @param inboxId - ID of the Inbox to delete
     */
    deleteInbox: (inboxId: string) => Promise<void>;

    /**
     * Prepares a request to send data to an Inbox. You do not have to be logged in to call this function
     * @param {string} inboxId ID of the Inbox to which the request applies
     * @param {Uint8Array} data - data that is being sent to the Inbox
     * @param {number[]} inboxFileHandles list of file handles that will be sent with the request
     * @param {string} userPrivKey optional sender's private key which can be used later to encrypt data for that sender
     * @returns {number} Inbox handle
     */
    prepareEntry: (
        inboxId: string,
        data: Uint8Array,
        inboxFileHandles?: Array<number>,
        userPrivKey?: string
    ) => Promise<number>;

    /**
     * Commits a request and sends it to an Inbox. You do not have to be logged in to call this function
     * @param {number} inboxHandle ID of the Inbox to which the request applies
     * @returns {void} nothing
     */

    sendEntry: (inboxHandle: number) => Promise<void>;

    /**
     * Gets an entry from an Inbox.
     * @param inboxEntryId ID of an entry to read from the Inbox
     * @returns {Promise<InboxEntry>} {@link InboxEntry `Promise<InboxEntry>`}
     */
    readEntry: (inboxEntryId: string) => Promise<InboxEntry>;

    /**
     * Gets list of entries of given Inbox.
     * @param {string} inboxId ID of the Inbox
     * @param {PagingQuery} query {@link PagingQuery `PagingQuery`}
     * @returns {Promise<PagingList<InboxEntry>>} {@link PagingList `Promise<PagingList<InboxEntry>>`}
     */
    listEntries: (inboxId: string, query: PagingQuery) => Promise<PagingList<InboxEntry>>;

    /**
     * Delete an entry from an Inbox.
     *
     * @param {string} inboxEntryId ID of an entry to delete from the Inbox
     *
     * @returns {Promise<void>}
     */
    deleteEntry: (inboxEntryId: string) => Promise<void>;

    /**
     * Creates a file handle to send a file to an Inbox. You do not have to be logged in to call this function.
     * @param {Uint8Array} publicMeta - (unencrypted) public file metadata
     * @param {Uint8Array} privateMeta - (encrypted) private file metadata
     * @param {number} fileSize - size of the file to send
     * @returns {number} file handle
     */
    createFileHandle: (
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        fileSize: number
    ) => Promise<number>;

    /**
     * Sends a file's data chunk to an Inbox. You do not have to be logged in to call this function. To send the entire file - divide it into pieces of the desired size and call the function for each fragment.
     * @param {number} inboxHandle ID of the Inbox to which the request applies
     * @param {number} inboxFileHandle file handle that will be sent with the request
     * @param {Uint8Array} dataChunk  file chunk to send
     * @returns {Promise<void>} void
     */
    writeToFile: (
        inboxHandle: number,
        inboxFileHandle: number,
        dataChunk: Uint8Array
    ) => Promise<void>;

    /**
     * Opens a file to read.
     * @param {string} fileId ID of the file to read
     * @returns {Promise<number>} handle to read file data
     */
    openFile: (fileId: string) => Promise<number>;

    /**
     * Reads file data
     * @param {number} fileHandle handle to the file
     * @param {number} length size of data to read
     * @returns {Promise<Uint8Array>} `Uint8Array` buffer with file data chunk
     */
    readFromFile: (fileHandle: number, length: number) => Promise<Uint8Array>;

    /**
     * Moves file's read cursor.
     * @param {number} fileHandle handle to the file
     * @param {number} position new cursor position
     * @returns {Promise<void>}
     */
    seekInFile: (fileHandle: number, position: number) => Promise<void>;

    /**
     * Closes the file by given handle
     * @param {number} fileHandle handle to the file
     * @returns {Promise<string>} ID of closed file
     */
    closeFile: (fileHandle: number) => Promise<string>;

    /**
     * Subscribes to Inbox related events:
     * - `inboxCreated`
     * - `inboxUpdated`
     * - `inboxDeleted`
     * @returns {Promise<void>}
     */
    subscribeForInboxEvents: () => Promise<void>;

    /**
     * Unsubscribes from Inbox related events
     * @returns {Promise<void>}
     */
    unsubscribeFromInboxEvents: () => Promise<void>;

    /**
     * Subscribes to Inbox entry related events:
     * - `inboxEntryCreated`
     * - `inboxEntryDeleted`
     * @param {string} inboxId - Inbox ID
     * @returns {Promise<void>}
     */
    subscribeForEntryEvents: (inboxId: string) => Promise<void>;

    /**
     * Unsubscribes from Inbox entry related events
     * @param {string} inboxId - Inbox ID
     * @returns {Promise<void>}
     */
    unsubscribeFromEntryEvents: (inboxId: string) => Promise<void>;
}
