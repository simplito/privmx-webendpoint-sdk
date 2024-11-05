import { EndpointApiEvent, ListOptions, PagingList, PrivmxFile, Store, UserWithPubKey } from '../../types';
import { EventsByChannel, StoreFileEvents, SubscribeForChannel } from '../../types/events';
import { StoreFilePayload } from '../../types/store';
import { FileUploader } from '../FileUploader';
import { StoreClient } from '../StoreClient';

export class GenericStore {
    constructor(private _storeClient: StoreClient) {
    }

    /**
     * Returns info about Store.
     * @returns {Promise<Store>}  {@link Store}
     */
    async info(): Promise<Store> {
        return await this._storeClient.getInfo();
    }

    /**
     * Gets a list of files in the Store.
     * @param pageIndex
     * @param {ListOptions} options optional {@link ListOptions options} object
     * @returns {Promise<PagingList<File>>} {@link PagingList `PagingList<File>`}
     */
    async getFiles(pageIndex?: number, options?: ListOptions): Promise<PagingList<PrivmxFile>> {
        return await this._storeClient.getFiles(pageIndex, options);
    }

    /**
     * Updates Store by overriding fields with new ones.
     * When updating, Bridge  will check version number. Updates of Store with different
     * version number will be rejected.
     * Version number is incremented after every update.
     *
     * @param {Object} newStore - new Store data
     * @param {UserWithPubKey[]} newStore.users list of {@link UserWithPubKey} with access to this Store
     * @param {UserWithPubKey[]} newStore.managers list of {@link UserWithPubKey} with management rights to this Store
     * @param {Uint8Array} newStore.publicMeta public (unencrypted) metadata
     * @param {Uint8Array} newStore.privateMeta (encrypted) metadata
     * @param {number} newStore.version - version number of the Store data
     * @param {boolean} [newStore.options.force] - optional flag to generate a new key ID for the Store
     * @param {boolean} [newStore.options.forceGenerateNewKey] - optional flag allowing new users to access old data
     * @returns {Promise<void>} promise that resolves when the Store update is complete
     */
    async update(newStore: {
        users: UserWithPubKey[];
        managers: UserWithPubKey[];
        publicMeta?: Uint8Array;
        privateMeta?: Uint8Array;
        version: number;
        options?: {
            force?: boolean;
            forceGenerateNewKey?: boolean;
        };
    }): Promise<void> {
        return await this._storeClient.storeUpdate(newStore);
    }

    /**
     * Upload file to server.
     * @param {StoreFilePayload} newFile {@link StoreFilePayload `StoreFilePayload`} object
     * @param {function(number): void} [progressCallback] optional callback function called after fetching each file chunk
     * @returns {Promise<string>} ID of uploaded file
     */
    async uploadData(
        newFile: StoreFilePayload,
        progressCallback?: (progress: number) => void
    ): Promise<string> {
        return await this._storeClient.uploadData(newFile, progressCallback);
    }

    /**
     * Function used to upload a file from a browser {@link File `File`} handle.
     * @param {object} newFile
     * @param {File} newFile.file - file to upload
     * @param {Uint8Array} newFile.publicMeta optional public (unencrypted) metadata
     * @param {Uint8Array} newFile.privateMeta optional (encrypted) metadata
     * @param {function(number): void} progressCallback optional callback function called after fetching each file chunk
     * @returns {Promise<string>} ID of the uploaded file
     */
    async uploadFile(
        newFile: {
            file: File;
            publicMeta?: Uint8Array;
            privateMeta?: Uint8Array;
        },
        progressCallback?: (progress: number) => void
    ): Promise<string> {
        return await this._storeClient.uploadFile(newFile, progressCallback);
    }

    /**
     * Deletes Store.
     * @returns {Promise<void>} promise that resolves to a boolean indicating whether the Store was successfully deleted
     */
    async delete(): Promise<void> {
        return await this._storeClient.deleteStore();
    }

    /**
     * @returns {string} `storeId`
     */
    get storeId(): string {
        return this._storeClient.storeId;
    }

    /**
     * Subscribes to file-related events on current Store:
     * - `storeFileCreated`
     * - `storeFileDeleted`
     * - `storeFileUpdated`
     * @returns {Promise<SubscribeForChannel<'storeFiles'>>} {@link SubscribeForChannel<'storeFiles'> `Promise<SubscribeForChannel<'storeFiles'>>`}
     */
    async subscribeForFileEvents(): Promise<SubscribeForChannel<'storeFiles'>> {
        return await this._storeClient.subscribeForFileEvents();
    }

    /**
     * Unsubscribes from file-related events in the Store.
     * @returns {Promise<void>} a promise that resolves with void
     */
    async unsubscribeFromFileEvents(): Promise<void> {
        return await this._storeClient.unsubscribeFromFileEvents();
    }

    /**
     * Allows you to handle streaming data to a Store.
     *
     * @param {StoreFilePayload} newFile - file to be streamed
     * @returns {Promise<StreamUploader>} - promise that resolves to a `StreamUploader` instance if successful, or void if an error occurs
     */
    async streamData(newFile: StoreFilePayload) {
        return await this._storeClient.streamData(newFile);
    }

    /**
     * Allows you to handle streaming a file from web File Handler.
     * @param {object} newFile
     * @param {File} newFile.file file to send
     * @param {Uint8Array=} [newFile.publicMeta] contains metadata that is not encrypted
     * @param {Uint8Array=} [newFile.privateMeta] contains confidential data that will be encrypted before being sent to server
     * @returns {Promise<FileUploader>} instance of `FileUploader`
     */
    async streamFile(newFile: {
        file: File;
        publicMeta?: Uint8Array;
        privateMeta?: Uint8Array;
    }): Promise<FileUploader> {
        return await this._storeClient.streamFile(newFile);
    }

    /**
     * Registers an event listener for Store file-related events.
     *
     * @template T
     * @param {T & EventsByChannel<'storeFiles'>} eventType - type of event to listen for
     * @param {function(Extract<EndpointApiEvent, { type: T }>): void} callback - callback function to execute when the event occurs
     * @returns {Promise<{on: SubscribeForChannel<'storeFiles'>, removeEventListener: function() void}>} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener
     */
    on<T extends EndpointApiEvent['type'] & EventsByChannel<'storeFiles'>>(
        eventType: T,
        callback: (payload: Extract<StoreFileEvents, { type: T }>) => void
    ): SubscribeForChannel<'storeFiles'> & { removeEventListener: () => void } {
        return this._storeClient.on(eventType, callback);
    }
}
