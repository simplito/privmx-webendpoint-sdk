import { PrivmxFile, PagingList, PagingQuery, Store, UserWithPubKey } from '../../types';
import { ContainerPolicy } from '../../types/policy';

export interface StoreApiInterface {
    /**
     * Creates a new Store in the given Context.
     * @param {string} contextId - ID of the Context to create the Store in
     * @param {UsersWithPubKey[]} users - list of {@link UserWithPubKey `UserWithPubKey`} object which indicates who will have access to the created Store
     * @param {UsersWithPubKey[]} managers - list of {@link UserWithPubKey `UserWithPubKey`} object which indicates who will have access (and management rights) to the created Store
     * @param {Uint8Array} publicMeta - (unencrypted) public metadata of the Store,
     * @param {Uint8Array} privateMeta - (encrypted) private metadata of the Store
     * @param {ContainerPolicy} policies Store's policies
     * @returns {string} created Store ID.
     */
    createStore: (
        contextId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        policies?: ContainerPolicy
    ) => Promise<string>;

    /**
     * Updates an existing Store.
     * @param {string} storeId - ID of the Store to update
     * @param {UsersWithPubKey[]} users - list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access to the updated Store
     * @param {UsersWithPubKey[]} managers - list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access (and management rights) to the updated Store
     * @param {Uint8Array} publicMeta - public metadata of the Store
     * @param {Uint8Array} privateMeta - private metadata of the file
     * @param {number} version - current version of the updated Store
     * @param {boolean} force - force update (without checking version)
     * @param {boolean} forceGenerateNewKey - force to re-generate a key for the Store
     * @param {ContainerPolicy} policies Store's policies
     */
    updateStore: (
        storeId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        version: number,
        force: boolean,
        forceGenerateNewKey: boolean,
        policies?: ContainerPolicy
    ) => Promise<void>;

    /**
     * Deletes a Store by given Store ID.
     * @param {string} storeId - ID of the Store to delete
     */
    deleteStore: (storeId: string) => Promise<void>;

    /**
     * Gets a single Store by given Store ID.
     * @param {string} storeId - ID of the Store to get
     * @returns {Promise<Store>} {@link Store `Promise<Store>`} object containing information about the Store.
     */
    getStore: (storeId: string) => Promise<Store>;

    /**
     * Gets a list of Stores in a given Context.
     * @param {string} contextId - ID of the Context to get the Stores from
     * @param {PagingQuery} {@link PagingQuery `PagingQuery`} object
     * @returns {Promise<PagingList<Store>>} {@link PagingList `Promise<PagingList<Store>>`} containing list of Stores.
     */
    listStores: (contextId: string, query: PagingQuery) => Promise<PagingList<Store>>;

    /**
     * Creates a new file in a Store.
     * @param {string} storeId - ID of the Store to create the file in
     * @param {Uint8Array} publicMeta - public metadata of the file
     * @param {Uint8Array} privateMeta - private metadata of the file - preferably you should save here the name, size and mimetype of given file
     * @param {number} size - size of the file
     * @returns {number} handle to write data
     */
    createFile: (
        storeId: string,
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        size: number
    ) => Promise<number>;

    /**
     * Updates an existing file in a Store.
     * @param {string} fileId - ID of the file
     * @param {Uint8Array} publicMeta - public metadata of the file
     * @param {Uint8Array} privateMeta - private metadata of the file
     * @param {number} size - size of the file
     * @returns {number} handle to write data
     */
    updateFile: (
        fileId: string,
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        size: number
    ) => Promise<number>;

    /**
     * Updates an existing file's metadata.
     * @param {string} fileId - ID of the file
     * @param {Uint8Array} publicMeta - public metadata of the file
     * @param {Uint8Array} privateMeta - private metadata of the file
     * @returns {Promise<void>}
     */
    updateFileMeta: (
        fileId: string,
        publicMeta: Uint8Array,
        privateMeta: Uint8Array
    ) => Promise<void>;

    /**
     * Writes data to file handle. Recommended size of a data chunk is 1048574.
     * @param {number} handle - handle to write file data
     * @param {Uint8Array} data - file data chunk
     */
    writeToFile: (handle: number, data: Uint8Array) => Promise<void>;

    /**
     * Deletes a file by a given ID.
     * @param {string} fileId - ID of the file to delete
     * @returns {Promise<void>}
     */
    deleteFile: (fileId: string) => Promise<void>;

    /**
     * Get single file by file ID given.
     *
     * @param {string} storeId ID of Store to get
     * @returns {PrivmxFile} {@link PrivmxFile `Promise<PrivmxFile>`}
     */
    getFile: (fileId: string) => Promise<PrivmxFile>;

    /**
     * Get list of files in Store given.
     *
     * @param {string} storeId ID of Store to get files from
     * @param {PagingQuery} {@link PagingQuery `PagingQuery`} object
     * @returns {Promise<PagingList<PrivmxFile>>} {@link PagingList `Promise<PagingList<File>>`} containing list of files
     */
    listFiles: (storeId: string, query: PagingQuery) => Promise<PagingList<PrivmxFile>>;

    /**
     * Opens a file to read.
     *
     * @param {string} fileId ID of file to read
     * @returns {number}  handle to read file data
     */
    openFile: (fileId: string) => Promise<number>;

    /**
     * Reads file data.
     *
     * If read data size is less than **P** length , then end of file.
     * Recommended  **P** length is 1048574.
     *
     * @param {number} handle handle to write file data
     * @param {string} length size of data to read
     * @returns {Uint8Array} buffer with file data chunk
     */
    readFromFile: (handle: number, chunk: number) => Promise<Uint8Array>;

    /**
     * Move read cursor.
     *
     * @param {number} handle handle to write file data
     * @param {number} pos new cursor position
     *
     * @returns {Promise<void>}
     */
    seekInFile: (handle: number, pos: number) => Promise<void>;

    /**
     * Close file handle.
     *
     * @param {number} handle handle to read/write file data
     * @returns {string} ID of closed file
     */
    closeFile: (handle: number) => Promise<string>;

    /**
     * Subscribes to Store related events:
     * - `storeCreated`
     * - `storeDeleted`
     * - `storeStatsChanged`
     * - `storeUpdated`
     * @returns {Promise<void>}
     */
    subscribeForStoreEvents: () => Promise<void>;

    /**
     * Unsubscribes from Store related events
     * @returns {Promise<void>}
     */
    unsubscribeFromStoreEvents: () => Promise<void>;

    /**
     * Subscribes to file-related events in given Store:
     * - `storeFileCreated`
     * - `storeFileDeleted`
     * - `storeFileUpdated`
     *
     * @param {string} storeId - ID of store to subscribe to
     * @returns {Promise<void>}
     */
    subscribeForFileEvents: (storeId: string) => Promise<void>;

    /**
     * Unsubscribes from file-related events in given Store
     * @param {string} storeId - ID of store to unsubscribe from
     * @returns {Promise<void>}
     */
    unsubscribeFromFileEvents: (storeId: string) => Promise<void>;
}
