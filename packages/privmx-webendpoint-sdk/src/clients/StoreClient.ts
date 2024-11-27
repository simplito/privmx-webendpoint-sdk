import { StoreApi } from '../api/store/StoreApi';
import { EventDispatcher } from '../EventDispatcher';
import { ListOptions, PagingList } from '../types/core';
import {
    Channel,
    EventsByChannel,
    StoreEvents,
    StoreFileEvents,
    SubscribeForChannel
} from '../types/events';
import { EndpointApiEvent, PrivmxFile, Store, UserWithPubKey } from '../types/index';
import { StoreFilePayload } from '../types/store';
import { FILE_MAX_CHUNK_SIZE } from '../utils/const';
import { Endpoint } from './Endpoint';
import { FileUploader } from './FileUploader';
import { StreamReader } from './StreamReader';
import { StreamUploader } from './StreamUploader';

export class StoreClient {
    private _storeId: string;
    private _endpoint: Endpoint;
    private _eventDispatcher: EventDispatcher;

    constructor(storeId: string, endpoint: Endpoint, eventDispatcher: EventDispatcher) {
        this._storeId = storeId;
        this._endpoint = endpoint;
        this._eventDispatcher = eventDispatcher;
    }

    get storeId() {
        return this._storeId;
    }

    /**
     * Gets Store metadata by given Store ID
     * @param {string} storeId - ID of given Store
     * @returns {Promise<Store>} - {@link Store `Promise<Store>`}
     */
    static async getStore(api: StoreApi, storeId: string): Promise<Store> {
        const store = await api.getStore(storeId);

        return store;
    }

    /**
     * Gets associated StoreApi
     * @returns {Promise<StoreApi>} {@link StoreApi `Promise<StoreApi>`}
     */
    private async getApi(): Promise<StoreApi> {
        return await this._endpoint.getStoreApi();
    }

    /**
     * Returns info about current Store
     * @returns {Promise<Store>} - {@link Store}
     */
    async getInfo(): Promise<Store> {
        const api = await this.getApi();
        const info = await api.getStore(this._storeId);
        return info;
    }

    /**
     * Creates a new Store in Context
     * @param {StoreApi} api {@link StoreApi `StoreApi`} instance
     * @param {object} newStore
     * @param {string} newStore.contextId Context ID in which the Store should be created
     * @param {UserWithPubKey[]} newStore.users list of {@link UserWithPubKey} with access to this Store
     * @param {UserWithPubKey[]} newStore.managers list of {@link UserWithPubKey} with manage rights to this Store
     * @param {Uint8Array} newStore.publicMeta optional public (unencrypted) metadata
     * @param {Uint8Array} newStore.privateMeta optional (encrypted) metadata
     *
     * @returns {Promise<string>} ID of the created Store
     */
    static async createStore(
        api: StoreApi,
        newStore: {
            contextId: string;
            users: UserWithPubKey[];
            managers: UserWithPubKey[];
            publicMeta?: Uint8Array;
            privateMeta?: Uint8Array;
        }
    ): Promise<string> {
        const meta = {
            publicMeta: newStore.publicMeta || new Uint8Array(),
            privateMeta: newStore.privateMeta || new Uint8Array()
        };

        return await api.createStore(
            newStore.contextId,
            newStore.users,
            newStore.managers,
            meta.publicMeta,
            meta.privateMeta
        );
    }

    /**
     * Returns metadata about given file
     * @param {string} fileId - The ID of the file to get metadata from
     * @returns {Promise<PrivmxFile>} {@link PrivmxFile `Promise<PrivmxFile>`}
     */
    static async getFileMetaData(api: StoreApi, fileId: string): Promise<PrivmxFile> {
        const file = await api.getFile(fileId);

        return file;
    }

    /**
     * Updates file metadata
     * @param {StoreApi} api {@link StoreApi `StoreApi`} instance
     * @param {object} file
     * @param {string} file.fileId - ID of file to update
     * @param {Uint8Array} file.publicMeta - metadata that will be unencrypted
     * @param {Uint8Array} file.privateMeta - metadata that will be encrypted
     * @returns {Promise<void>} -  a promise that resolves with void
     */
    static async updateFileMeta(
        api: StoreApi,
        file: { fileId: string; publicMeta?: Uint8Array; privateMeta?: Uint8Array }
    ): Promise<void> {
        const meta = {
            publicMeta: file.publicMeta || new Uint8Array(),
            privateMeta: file.privateMeta || new Uint8Array()
        };

        return await api.updateFileMeta(file.fileId, meta.publicMeta, meta.privateMeta);
    }

    /**
     * Gets a list of files in the given Store.
     * @param pageIndex
     * @param {ListOptions} options optional {@link ListOptions options} object
     * @returns {Promise<PagingList<File>>} {@link PagingList `PagingList<File>`}
     */
    async getFiles(pageIndex?: number, options?: ListOptions): Promise<PagingList<PrivmxFile>> {
        const _options = {
            pageSize: 100,
            sort: 'desc',
            ...options
        } satisfies ListOptions;

        const _pageIndex = pageIndex ? pageIndex : 0;

        const api = await this.getApi();
        const filesList = await api.listFiles(this._storeId, {
            limit: _options.pageSize,
            skip: _options.pageSize * _pageIndex,
            sortOrder: _options.sort,
            lastId: _options.lastId
        });
        return filesList;
    }

    /**
     * List Stores the user has access to
     * @param {StoreApi} api {@link StoreApi `StoreApi`} instance
     * @param {string} contextId
     * @param {number} pageIndex - indicates from which page the list should start
     * @param {ListOptions} options optional {@link ListOptions options} object
     * @returns {Promise<PagingList<Store>>} - {@link PagingList `PagingList<Store>`}
     */
    static async getStores(
        api: StoreApi,
        contextId: string,
        pageIndex?: number,
        options?: ListOptions
    ): Promise<PagingList<Store>> {
        const _options = {
            pageSize: 100,
            sort: 'desc',
            ...options
        } satisfies ListOptions;

        const _pageIndex = pageIndex ? pageIndex : 0;

        const storeList = await api.listStores(contextId, {
            limit: _options.pageSize,
            skip: _options.pageSize * _pageIndex,
            sortOrder: _options.sort,
            lastId: _options.lastId
        });

        return storeList;
    }

    /**
     * Reads a file and returns a stream handler along with its metadata.
     * @param {string} fileId - The ID of the file to be read.
     * @returns {Promise<{streamReader: StreamReader, size: number, mimetype: string, name: string}>}
     * A promise that resolves with object containing the stream reader, file size, MIME type, and file name.
     *
     * @example
     *```js
     *const fileStream = await StoreClient.readFile('sdjvs');
     *  while (await fileStream.streamReader.readNextChunk()) {
     *  console.log('Current progress: ', fileStream.streamReader.progress);
     *}
     *  fileStream.streamReader.close();
     *```
     */

    static async streamRead(api: StoreApi, fileId: string): Promise<StreamReader> {
        const handle = await api.openFile(fileId);
        const streamReader = new StreamReader(handle, api);

        return streamReader;
    }

    /**
     * Get the content of given file
     * @param {StoreApi} api {@link StoreApi `StoreApi`} instance
     * @param {string} fileId - ID of the file to get the content from
     * @param {function(number): void} progressCallback optional function to report progress
     * @returns {Promise<Uint8Array>} content of the file
     */
    static async getFileContents(
        api: StoreApi,
        fileId: string,
        progressCallback?: (progress: number) => void
    ): Promise<Uint8Array> {
        const streamReader = await this.streamRead(api, fileId);
        while (await streamReader.readNextChunk()) {
            if (progressCallback) {
                progressCallback(streamReader.progress);
            }
        }

        return streamReader.data;
    }

    /**
     * Downloads file from Store to your local environment
     * @param {StoreApi} api {@link StoreApi `StoreApi`} instance
     * @param {object} file
     * @param {string} file.fileId File ID
     * @param {string} [file.name] - Optional name given to the file
     * @param {function(number): void} [file.progressCallback] - Optional callback function to report progress
     *
     * @returns {Promise<void>} a promise that resolves with void and download the file to the browser environment
     */

    static async downloadFile(
        api: StoreApi,
        file: { fileId: string; name?: string; progressCallback?: (progress: number) => void }
    ): Promise<void> {
        const filename = file.name ? file.name : file.fileId.slice(0, file.fileId.length / 2);

        if ('showSaveFilePicker' in window) {
            return await this.chunkDownload(api, {
                fileId: file.fileId,
                name: filename,
                progressCallback: file.progressCallback
            });
        }
        const data = await StoreClient.getFileContents(api, file.fileId, file.progressCallback);
        const anchor = document.createElement('a');

        const reader = new FileReader();
        reader.onload = (e) => {
            if (!e.target) return;
            anchor.href = e.target.result as string;
            anchor.download = filename;
            anchor.click();
        };

        reader.readAsDataURL(new Blob([data]));
    }

    /**
     * Downloads file using the window.showSaveFilePicker
     * @param {StoreApi} api {@link StoreApi `StoreApi`} instance
     * @param {object} file
     * @param {string} file.fileId File ID
     * @param {string} [file.name] - name given to the file
     * @param {function(number): void} [file.progressCallback] - Optional callback function to report progress
     */
    private static async chunkDownload(
        api: StoreApi,
        file: { fileId: string; name: string; progressCallback?: (progress: number) => void }
    ) {
        const fileMeta = await api.getFile(file.fileId);

        //@ts-ignore
        const systemHandle = (await window.showSaveFilePicker({
            id: 0,
            suggestedName: file.name,
            startIn: 'downloads'
        })) as FileSystemFileHandle;

        const accessHandle = await systemHandle.createWritable();
        let totalBytesWritten = 0;

        const fileHandle = await api.openFile(file.fileId);
        while (true) {
            const data = await api.readFromFile(fileHandle, FILE_MAX_CHUNK_SIZE);
            accessHandle.write(data);
            totalBytesWritten += data.length;
            const progress = (fileMeta.size / totalBytesWritten) * 100;
            if (file.progressCallback) {
                file.progressCallback(progress);
            }

            if (data.length < FILE_MAX_CHUNK_SIZE) {
                break;
            }
        }

        await accessHandle.close();
        await api.closeFile(fileHandle);
    }

    /**
     * Streams a file to a Store.
     *
     * @param {StoreFilePayload} newFile - The file to be streamed.
     * @returns {Promise<StreamUploader>} - A promise that resolves to a StreamUploader instance if successful, or void if an error occurs.
     */
    async streamData(newFile: StoreFilePayload): Promise<StreamUploader> {
        const api = await this.getApi();

        const meta = {
            publicMeta: newFile.publicMeta || new Uint8Array(),
            privateMeta: newFile.privateMeta || new Uint8Array()
        };

        const handle = await api.createFile(
            this._storeId,
            meta.publicMeta,
            meta.privateMeta,
            newFile.data.length
        );
        const streamer = new StreamUploader(handle, newFile.data, api);

        return streamer;
    }

    /**
     * Allows you to handle streaming a file from web File Handler
     * @param {object} newFile
     * @param {File} newFile.file
     * @param {Uint8Array=} [newFile.publicMeta] contains data that can be accessed by everyone and is not encrypted.
     * @param {Uint8Array=} [newFile.privateMeta] contains confidential data that will be encrypted before sent to server
     * @returns {Promise<FileUploader>} instance of a FileUploader
     */
    async streamFile(newFile: {
        file: File;
        publicMeta?: Uint8Array;
        privateMeta?: Uint8Array;
    }): Promise<FileUploader> {
        const api = await this.getApi();

        const meta = {
            publicMeta: newFile.publicMeta || new Uint8Array(),
            privateMeta: newFile.privateMeta || new Uint8Array()
        };

        const handle = await api.createFile(
            this._storeId,
            meta.publicMeta,
            meta.privateMeta,
            newFile.file.size
        );

        const streamer = new FileUploader(handle, newFile.file, api);

        return streamer;
    }

    /**
     * Upload custom data to a Store
     * @param {StoreFilePayload} newData {@link StoreFilePayload `StoreFilePayload`}
     * @param {function(number): void} progressCallback - Optional callback function to report progress
     * @returns {Promise<string>} file ID
     */
    async uploadData(
        newData: StoreFilePayload,
        progressCallback?: (progress: number) => void
    ): Promise<string> {
        const meta = {
            publicMeta: newData.publicMeta || new Uint8Array(),
            privateMeta: newData.privateMeta || new Uint8Array()
        };
        const streamer = await this.streamData({
            data: newData.data,
            privateMeta: meta.privateMeta,
            publicMeta: meta.publicMeta
        });
        while (await streamer.sendNextChunk()) {
            if (progressCallback) {
                progressCallback(streamer.progress);
            }
        }
        return await streamer.close();
    }

    /**
     * Update file contents
     * @param {StoreApi} api {@link StoreApi `StoreApi`} instance
     * @param {object} params
     * @param {string} params.fileId fileId
     * @param {Uint8Array} params.data
     * @param {number} params.offset - where to start appending data
     * @param {function(number): void} [params.progressCallback] - Optional callback function to report progress
     * @returns {Promise<string>} file ID
     */
    static async updateFile(
        api: StoreApi,
        params: {
            fileId: string;
            data: Uint8Array;
            offset?: number;
            progressCallback?: (progress: number) => void;
        }
    ): Promise<string> {
        const handle = await api.openFile(params.fileId);
        const streamer = new StreamUploader(
            handle,
            params.data,
            api,
            params.offset !== undefined ? params.offset : 0
        );
        while (await streamer.sendNextChunk()) {
            if (params.progressCallback) {
                params.progressCallback(streamer.progress);
            }
        }
        return await streamer.close();
    }

    /**
     * Override file contents
     * @param {StoreApi} api {@link StoreApi `StoreApi`} instance
     * @param {object} params - params
     * @param {string} params.fileId - fileId
     * @param {StoreFilePayload} params.file {@link StoreFilePayload `StoreFilePayload`} object
     * @param {function(number): void} [params.progressCallback] - Optional callback function to report progress
     * @returns {Promise<string>} file ID
     */
    static async overrideFile(
        api: StoreApi,
        params: {
            fileId: string;
            file: StoreFilePayload;
            progressCallback?: (progress: number) => void;
        }
    ): Promise<string> {
        const meta = {
            publicMeta: params.file.publicMeta || new Uint8Array(),
            privateMeta: params.file.privateMeta || new Uint8Array()
        };

        const handle = await api.updateFile(
            params.fileId,
            meta.publicMeta,
            meta.privateMeta,
            params.file.data.length
        );
        const streamer = new StreamUploader(handle, params.file.data, api);

        while (await streamer.sendNextChunk()) {
            if (params.progressCallback) {
                params.progressCallback(streamer.progress);
            }
        }
        return await streamer.close();
    }

    /**
     * Deletes file from Store.
     * @param {string} fileId - The ID of the file to delete.
     * @returns {Promise<boolean>} A promise that resolves when the file is successfully deleted.
     */
    static async deleteFile(api: StoreApi, fileId: string): Promise<void> {
        return await api.deleteFile(fileId);
    }

    /**
     * Deletes current Store.
     * @returns {Promise<void>} A promise that resolves when the Store updates successfully deleted.
     */
    async deleteStore(): Promise<void> {
        const api = await this.getApi();
        return await api.deleteStore(this._storeId);
    }

    /**
     * Updates metadata about the given Store.
     *
     * @param {Object} newStore - The new Store data.
     * @param {UserWithPubKey[]} newStore.users list of {@link UserWithPubKey} with access to this Store
     * @param {UserWithPubKey[]} newStore.managers list of {@link UserWithPubKey} with manage rights to this Store
     * @param {Uint8Array} newStore.publicMeta public (unencrypted) metadata
     * @param {Uint8Array} newStore.privateMeta (encrypted) metadata
     * @param {number} newStore.version - The version number of the Store data.
     * @param {boolean} [newStore.options.force] - optional flag to generate a new key ID for the Store
     * @param {boolean} [newStore.options.forceGenerateNewKey] - optional flag to allow new users to access old data
     * @returns {Promise<void>} A promise that resolves when the Store update is complete.
     */

    async storeUpdate(newStore: {
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
        const api = await this.getApi();

        const meta = {
            publicMeta: newStore.publicMeta || new Uint8Array(),
            privateMeta: newStore.privateMeta || new Uint8Array()
        };

        return await api.updateStore(
            this._storeId,
            newStore.users,
            newStore.managers,
            meta.publicMeta,
            meta.privateMeta,
            newStore.version,
            newStore.options?.force || false,
            newStore.options?.forceGenerateNewKey || false
        );
    }

    private getOn(eventDispatcher: EventDispatcher) {
        return <T extends EndpointApiEvent['type'] & EventsByChannel<'storeFiles'>>(
            eventType: T,
            callback: (payload: Extract<EndpointApiEvent, { type: T }>) => void
        ) => {
            const removeEventListener = eventDispatcher.addEventListener(
                `store/${this.storeId}/files`,
                eventType,
                callback
            );
            const _on = this.getOn(eventDispatcher);

            return { on: _on, removeEventListener };
        };
    }

    /**
     * Subscribes to file-related events in given Store:
     * - `storeFileCreated`
     * - `storeFileDeleted`
     * - `storeFileUpdated`
     * @returns {Promise<SubscribeForChannel<'storeFiles'>>} {@link SubscribeForChannel<'storeFiles'> `Promise<SubscribeForChannel<'storeFiles'>>`}
     */
    async subscribeForFileEvents(): Promise<SubscribeForChannel<'storeFiles'>> {
        const channel: Channel = `store/${this._storeId}/files`;
        if (!this._eventDispatcher.isSubscribedToChannel(channel)) {
            this._eventDispatcher.addChannelSubscription(channel);
            const api = await this.getApi();
            await api.subscribeForFileEvents(this.storeId);
        }

        const subscriber = this.on.bind(this);

        return { on: subscriber };
    }

    /**
     * Unsubscribes from file-related events in this Store
     * @returns {Promise<void>} a promise that resolves with void
     */
    async unsubscribeFromFileEvents(): Promise<void> {
        const channel: Channel = `store/${this.storeId}/files`;
        if (!this._eventDispatcher.isSubscribedToChannel(channel)) {
            return;
        }

        const api = await this.getApi();
        this._eventDispatcher.removeChannelSubscription(channel);
        return await api.unsubscribeFromFileEvents(this.storeId);
    }

    /**
     * Registers an event listener for store file-related events.
     *
     * @template T
     * @param {T & EventsByChannel<'storeFiles'>} eventType - type of event to listen for.
     * @param {function(Extract<EndpointApiEvent, { type: T }>): void} callback - callback function to execute when the event occurs.
     * @returns {Promise<{on: SubscribeForChannel<'storeFiles'>, removeEventListener: function() void}>} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener.
     */
    on<T extends EventsByChannel<'storeFiles'>>(
        eventType: T,
        callback: (payload: Extract<StoreFileEvents, { type: T }>) => void
    ): SubscribeForChannel<'storeFiles'> & { removeEventListener: () => void } {
        if (!this._eventDispatcher.isSubscribedToChannel(`store/${this.storeId}/files`)) {
            console.warn(
                'You registered a event callback, but you are not subscribed store files events.'
            );
        }

        const removeEventListener = this._eventDispatcher.addEventListener(
            `store/${this.storeId}/files`,
            eventType,
            callback
        );
        const _on = this.getOn(this._eventDispatcher);

        return { on: _on, removeEventListener };
    }

    private static getOn(eventDispatcher: EventDispatcher) {
        return <T extends EndpointApiEvent['type'] & EventsByChannel<'store'>>(
            eventType: T,
            callback: (payload: Extract<EndpointApiEvent, { type: T }>) => void
        ) => {
            const removeEventListener = eventDispatcher.addEventListener(
                'store',
                eventType,
                callback
            );
            const _on = StoreClient.getOn(eventDispatcher);

            return { on: _on, removeEventListener };
        };
    }

    /**
     * Subscribes to events related to Stores:
     *  - `storeCreated`
     *  - `storeDeleted`
     *  - `storeStatsChanged`
     *  - `storeUpdated`
     * @param {StoreApi} api - instance of Store Api
     * @param {EventDispatcher} eventDispatcher {@link EventDispatcher eventDispatcher}
     * @returns {Promise<SubscribeForChannel<'store'>>} {@link SubscribeForChannel<'store'> `Promise<SubscribeForChannel<'store'>>`}
     */
    static async subscribeForStoreEvents(
        api: StoreApi,
        eventDispatcher: EventDispatcher
    ): Promise<SubscribeForChannel<'store'>> {
        const channel: Channel = 'store';
        if (!eventDispatcher.isSubscribedToChannel(channel)) {
            eventDispatcher.addChannelSubscription(channel);
            await api.subscribeForStoreEvents();
        }

        const on = StoreClient.getOn(eventDispatcher);

        return { on };
    }

    /**
     * Unsubscribes from events related to stores
     * @param {StoreApi} api - instance of Store Api
     * @param {EventDispatcher} eventDispatcher {@link EventDispatcher eventDispatcher}
     * @returns {Promise<void>} a promise that resolves with void
     */
    static async unsubscribeFromStoreEvents(
        api: StoreApi,
        eventDispatcher: EventDispatcher
    ): Promise<void> {
        const channel: Channel = 'store';
        if (!eventDispatcher.isSubscribedToChannel(channel)) {
            return;
        }
        eventDispatcher.removeChannelSubscription(channel);
        return await api.unsubscribeFromStoreEvents();
    }

    /**
     * Registers an event listener for Store-related events.
     *
     * @template T
     * @param {EventDispatcher} eventDispatcher
     * @param {T & EventsByChannel<'store'>} eventType - type of event to listen for.
     * @param {function(Extract<StoreEvents, { type: T }>): void} callback - callback function to execute when the event occurs.
     * @returns {Promise<{on: SubscribeForChannel<'store'>, removeEventListener: function() void}>} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener.
     */
    static on<T extends EndpointApiEvent['type'] & EventsByChannel<'store'>>(
        eventDispatcher: EventDispatcher,
        eventType: T,
        callback: (payload: Extract<StoreEvents, { type: T }>) => void
    ): SubscribeForChannel<'store'> & { removeEventListener: () => void } {
        if (!eventDispatcher.isSubscribedToChannel('store')) {
            console.warn(
                'You registered a event callback, but you are not subscribed to store events.'
            );
        }

        const removeEventListener = eventDispatcher.addEventListener('store', eventType, callback);
        const _on = this.getOn(eventDispatcher);

        return { on: _on, removeEventListener };
    }

    /**
     * Function to upload a file from a browser {@link File `File`} handle
     * @param {object} newFile
     * @param {File} newFile.file - file to upload
     * @param {Uint8Array} newFile.publicMeta optional public (unencrypted) metadata
     * @param {Uint8Array} newFile.privateMeta optional (encrypted) metadata
     * @param {function(number): void} progressCallback optional function to report progress
     * @returns {Promise<string>} return the ID of the uploaded file
     */
    async uploadFile(
        newFile: { file: File; publicMeta?: Uint8Array; privateMeta?: Uint8Array },
        progressCallback?: (progress: number) => void
    ): Promise<string> {
        const _newFile = {
            publicMeta: new Uint8Array(),
            privateMeta: new Uint8Array(),
            ...newFile
        };
        const streamer = await this.streamFile(_newFile);

        while (await streamer.sendNextChunk()) {
            if (progressCallback) {
                progressCallback(streamer.progress);
            }
        }
        return await streamer.close();
    }
}
