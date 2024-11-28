import { EventDispatcher } from '../../EventDispatcher';
import { EndpointApiEvent, ListOptions, PagingList, PrivmxFile, Store } from '../../types';
import { EventsByChannel, StoreEvents, SubscribeForChannel } from '../../types/events';
import { Endpoint } from '../Endpoint';
import { StoreClient } from '../StoreClient';
import { CreateStorePayload, StoreFilePayload } from '../../types/store';
import { StreamReader } from '../StreamReader';

/**
 * Provides a wrapper for functions used to manage Stores in given Context.
 */
export class ContextStores {
    constructor(
        private _endpoint: Endpoint,
        private _eventDispatcher: EventDispatcher
    ) {}

    /**
     * Lists Stores the user has access to.
     * @param {object} query
     * @param {string} query.contextId - indicates from which Context should Stores be fetched
     * @param {number} query.pageIndex - indicates from which page the list should start
     * @param {ListOptions} query.options optional {@link ListOptions options} object
     * @returns {Promise<PagingList<Store>>} - {@link PagingList `PagingList<Store>`}
     */
    async list(query: {
        contextId: string;
        pageIndex?: number;
        options?: ListOptions;
    }): Promise<PagingList<Store>> {
        const api = await this._endpoint.getStoreApi();

        return await StoreClient.getStores(api, query.contextId, query.pageIndex, query.options);
    }

    /**
     * Creates a Store inside Context
     * @param {object} info
     * @param {UserWithPubKey[]} info.users list of {@link UserWithPubKey} with access to this Store
     * @param {UserWithPubKey[]} info.managers list of {@link UserWithPubKey} with management rights to the Store
     * @param {Uint8Array} info.publicMeta optional public (unencrypted) metadata
     * @param {Uint8Array} info.privateMeta optional (encrypted) metadata
     *
     * @returns {Promise<string>} ID of the created Store
     */
    async new(info: CreateStorePayload): Promise<string> {
        const api = await this._endpoint.getStoreApi();

        return await StoreClient.createStore(api, { ...info });
    }

    /**
     * Downloads file from Store to your local environment.
     * On platforms that supports FileAPI 'showFilePicker' method it will fetch file in chunks. Otherwise, File will be downloaded to memory first.
     *
     * @param {object} file
     * @param {string} file.fileId file ID
     * @param {string=} [file.fileName] - optional name that will be given to the file
     * @param {function(number): void} [file.progressCallback] - optional callback function to report progress
     *
     * @returns {Promise<void>} a promise that resolves with void and downloads the file to the browser environment
     */
    async downloadFile(file: {
        fileId: string;
        fileName?: string;
        progressCallback?: (progress: number) => void;
    }): Promise<void> {
        const api = await this._endpoint.getStoreApi();
        return await StoreClient.downloadFile(api, {
            fileId: file.fileId,
            name: file.fileName,
            progressCallback: file.progressCallback
        });
    }

    /**
     * Deletes file from Store.
     * @param {string} fileId - ID of the file to delete
     * @returns {Promise<boolean>} promise that resolves when the file is successfully deleted
     */
    async deleteFile(fileId: string): Promise<void> {
        const api = await this._endpoint.getStoreApi();
        return await StoreClient.deleteFile(api, fileId);
    }

    /**
     * Returns metadata about given file.
     * @param {string} fileId - ID of the file to get metadata from
     * @returns {Promise<PrivmxFile>} {@link PrivmxFile `Promise<PrivmxFile>`}
     */
    async getFileMetadata(fileId: string): Promise<PrivmxFile> {
        const api = await this._endpoint.getStoreApi();
        return await StoreClient.getFileMetaData(api, fileId);
    }

    /**
     * Updates file metadata.
     * @param {object} file
     * @param {string} file.fileId - ID of file to update
     * @param {Uint8Array} file.publicMeta - metadata that will not be encrypted
     * @param {Uint8Array} file.privateMeta - metadata that will be encrypted
     * @returns {Promise<void>} -  a promise that resolves with void
     */
    async updateFileMetaData(file: {
        fileId: string;
        publicMeta?: Uint8Array;
        privateMeta?: Uint8Array;
    }): Promise<void> {
        const api = await this._endpoint.getStoreApi();
        return await StoreClient.updateFileMeta(api, file);
    }

    /**
     * Updates file contents.
     * @param {object} params
     * @param {string} params.fileId `fileId`
     * @param {Uint8Array} params.data New content of the file
     * @param {number} params.offset - where to start appending data
     * @param {function(number): void} [params.progressCallback] - optional callback function to report progress
     * @returns {Promise<string>} ID of the updated file
     */
    async updateFile(params: {
        fileId: string;
        data: Uint8Array;
        offset?: number;
        progressCallback?: (progress: number) => void;
    }): Promise<string> {
        const api = await this._endpoint.getStoreApi();
        return await StoreClient.updateFile(api, params);
    }

    /**
     * Overrides file contents.
     * @param {object} params
     * @param {string} params.fileId ID of file to override
     * @param {StoreFilePayload} params.file {@link StoreFilePayload `StoreFilePayload`} object
     * @param {function(number): void} [params.progressCallback] - optional callback function called after sending each file chunk
     * @returns {Promise<string>} file ID
     */
    async overrideFile(params: {
        fileId: string;
        file: StoreFilePayload;
        progressCallback?: (progress: number) => void;
    }): Promise<string> {
        const api = await this._endpoint.getStoreApi();
        return await StoreClient.overrideFile(api, {
            file: params.file,
            fileId: params.fileId,
            progressCallback: params.progressCallback
        });
    }

    /**
     * Subscribes to events related to Stores:
     *  - `storeCreated`
     *  - `storeDeleted`
     *  - `storeStatsChanged`
     *  - `storeUpdated`
     * @returns {Promise<SubscribeForChannel<'store'>>} {@link SubscribeForChannel<'store'> `Promise<SubscribeForChannel<'store'>>`}
     */
    async subscribeToStores(): Promise<SubscribeForChannel<'store'>> {
        const api = await this._endpoint.getStoreApi();
        return await StoreClient.subscribeForStoreEvents(api, this._eventDispatcher);
    }

    /**
     * Unsubscribes and removes all registered callbacks for events related to Stores.
     * @returns {Promise<void>} - a promise that resolves with void
     */
    async unsubscribeFromStoreEvents(): Promise<void> {
        const api = await this._endpoint.getStoreApi();
        return await StoreClient.unsubscribeFromStoreEvents(api, this._eventDispatcher);
    }

    /**
     * Registers an event listener for Store-related events.
     *
     * @template T
     * @param {T & EventsByChannel<'store'>} eventType - type of event to listen for
     * @param {function(Extract<EndpointApiEvent, { type: T }>): void} callback - callback function to execute when the event occurs
     * @returns {Promise<{on: SubscribeForChannel<'store'>, removeEventListener: function() void}>} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener
     */
    on<T extends EndpointApiEvent['type'] & EventsByChannel<'store'>>(
        eventType: T,
        callback: (payload: Extract<StoreEvents, { type: T }>) => void
    ): SubscribeForChannel<'store'> & { removeEventListener: () => void } {
        return StoreClient.on(this._eventDispatcher, eventType, callback);
    }

    /**
     * Gets the content of given file.
     * File is fetched in chunks and stored in memory.
     * @param {string} fileId - ID of the file to get the content from
     * @param {function(number): void} progressCallback optional callback function called after fetching each file chunk
     * @returns {Promise<Uint8Array>} content of the file
     */
    async getFileContents(
        fileId: string,
        progressCallback?: (progress: number) => void
    ): Promise<Uint8Array> {
        const api = await this._endpoint.getStoreApi();

        return StoreClient.getFileContents(api, fileId, progressCallback);
    }

    /**
     * @param {string} fileId ID of the file to read
     * @returns {Promise<StreamReader>} returns an instance of {@link StreamReader `StreamReader`} class
     */
    async streamRead(fileId: string): Promise<StreamReader> {
        const api = await this._endpoint.getStoreApi();

        return StoreClient.streamRead(api, fileId);
    }
}
