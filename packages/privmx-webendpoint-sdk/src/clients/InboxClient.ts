import { InboxApi } from '../api/inbox/InboxApi';
import { StoreApi } from '../api/store/StoreApi';
import { EventDispatcher } from '../EventDispatcher';
import {
    EndpointApiEvent,
    Inbox,
    InboxEntry,
    InboxPublicView,
    ListOptions,
    PagingList
} from '../types';
import {
    Channel,
    EventsByChannel,
    InboxEntryEvents,
    InboxEvents,
    SubscribeForChannel
} from '../types/events';
import { CreateInboxPayload, InboxEntryPayload, UpdateInboxPayload } from '../types/inboxes';
import { InboxFileUploader } from './InboxFileUploader';
import { Endpoint } from './Endpoint';
import { FILE_MAX_CHUNK_SIZE } from '../utils/const';
import { StreamReader } from './StreamReader';

/**
 * Wrapper class for the InboxApi.
 */
export class InboxClient {
    private _inboxId: string;
    private _endpoint: Endpoint;
    private _eventDispatcher: EventDispatcher;

    constructor(inboxId: string, endpoint: Endpoint, eventDispatcher: EventDispatcher) {
        this._inboxId = inboxId;
        this._endpoint = endpoint;
        this._eventDispatcher = eventDispatcher;
    }

    /**
     * @returns {string} `inboxId`
     */
    get inboxId(): string {
        return this._inboxId;
    }

    private async getApi() {
        return await this._endpoint.getInboxApi();
    }

    /**
     * Creates a new Inbox
     * @param {InboxApi} api {@link InboxApi `InboxApi`}
     * @param {object} newInbox
     * @param {string} newInbox.contextId - ID of the Context for the new Inbox
     * @param {UserWithPubKey[]} newInbox.users - list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access to the created Inbox
     * @param {UserWithPubKey[]} newInbox.managers - list of {@link UserWithPubKey `UserWithPubKey`} objects  which indicates who will have access (and management rights) to the created Inbox
     * @param {Uint8Array} newInbox.publicMeta - (unencrypted) public Inbox metadata
     * @param {Uint8Array} newInbox.privateMeta - (encrypted) private Inbox metadata
     * @param {FilesConfig} newInbox.filesConfig object to override default file configuration
     * @returns {Promise<string>} Created Inbox ID
     */
    public static async createInbox(api: InboxApi, newInbox: CreateInboxPayload): Promise<string> {
        const meta = {
            publicMeta: newInbox.publicMeta || new Uint8Array(),
            privateMeta: newInbox.privateMeta || new Uint8Array()
        };

        const newInboxId = await api.createInbox(
            newInbox.contextId,
            newInbox.users,
            newInbox.managers,
            meta.publicMeta,
            meta.privateMeta,
            newInbox.filesConfig || undefined
        );

        return newInboxId;
    }

    /**
     * Gets a list of Inboxes in the given Context.
     * @param {InboxApi} api {@link InboxApi `InboxApi`}
     * @param {string} contextId ID of the Context to get Inboxes from
     * @param {number} pageIndex - indicates from which page the list should start
     * @param {ListOptions=} options optional {@link ListOptions options} object
     * @returns {Promise<PagingList<Inbox>>} - {@link PagingList `PagingList<Inbox>`}
     */
    public static async getInboxes(
        api: InboxApi,
        contextId: string,
        pageIndex?: number,
        options?: ListOptions
    ): Promise<PagingList<Inbox>> {
        const _options = {
            pageSize: 100,
            sort: 'desc',
            ...options
        } satisfies ListOptions;

        const _pageIndex = pageIndex ? pageIndex : 0;

        const inboxList = await api.listInboxes(contextId, {
            limit: _options.pageSize,
            skip: _options.pageSize * _pageIndex,
            sortOrder: _options.sort,
            lastId: _options.lastId
        });

        return inboxList;
    }

    /**
     * Fetches info about current Inbox
     * @returns {Promise<Inbox>}  {@link Inbox `Inbox`} object
     */
    public async getInboxInfo(): Promise<Inbox> {
        const api = await this.getApi();
        const inboxInfo = await api.getInbox(this._inboxId);

        return inboxInfo;
    }

    /**
     * Fetches inbox public meta.
     * @returns {Promise<InboxPublicView>}
     */
    public async getPublicView(): Promise<InboxPublicView> {
        const api = await this.getApi();
        const inboxPublicView = await api.getInboxPublicView(this._inboxId);

        return inboxPublicView;
    }

    /**
     * Updates an existing Inbox.
     * @param {object} updatedData
     * @param {UserWithPubKey[]} updatedData.users list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access to the updated Inbox
     * @param {UserWithPubKey[]} updatedData.managers list of {@link UserWithPubKey `UserWithPubKey`} objects  which indicates who will have access (and management rights) to the updated Inbox
     * @param {Uint8Array} updatedData.publicMeta - (unencrypted) public Inbox metadata
     * @param {Uint8Array} updatedData.privateMeta - (encrypted) private Inbox metadata
     * @param {FilesConfig | undefined} updatedData.filesConfig object to override default file configuration. Provide undefined if you want to leave the default configuration.
     * @param {number} updatedData.version current version of the updated Inbox
     * @param {boolean} [updatedData.options.force] - optional flag to generate a new key ID for the Inbox
     * @param {boolean} [updatedData.options.forceGenerateNewKey] - optional flag to allow new users to access old data
     * @returns {Promise<void>}
     */
    public async updateInbox(updatedData: UpdateInboxPayload): Promise<void> {
        const api = await this.getApi();

        const meta = {
            publicMeta: updatedData.publicMeta || new Uint8Array(),
            privateMeta: updatedData.privateMeta || new Uint8Array()
        };

        return await api.updateInbox(
            this._inboxId,
            updatedData.users,
            updatedData.managers,
            meta.publicMeta,
            meta.privateMeta,
            updatedData.filesConfig || undefined,
            updatedData.version,
            updatedData.options?.force || false,
            updatedData.options?.forceGenerateNewKey || false
        );
    }

    /**
     * Deletes current Inbox
     * @returns {Promise<void>} a promise that resolves with void
     */
    public async deleteInbox(): Promise<void> {
        const api = await this.getApi();
        return await api.deleteInbox(this._inboxId);
    }

    /**
     * Sends data and optional files to an Inbox.
     *
     * @param {InboxEntryPayload} entry {@link InboxEntryPayload `InboxEntryPayload`} object
     * @returns {Promise<void>} A promise that resolves when the data and files have been successfully sent to the Inbox.
     */

    public async sendData(entry: InboxEntryPayload): Promise<void> {
        const api = await this.getApi();

        const filesWithHandles = entry.files
            ? await Promise.all(
                  entry.files.map(async (file) => {
                      const meta = {
                          publicMeta: file.publicMeta || new Uint8Array(),
                          privateMeta: file.privateMeta || new Uint8Array()
                      };

                      if (file.data instanceof Uint8Array) {
                          return {
                              data: file.data,
                              handle: await api.createFileHandle(
                                  meta.publicMeta,
                                  meta.privateMeta,
                                  file.data.length
                              )
                          };
                      }

                      return {
                          data: file.data,
                          handle: await api.createFileHandle(
                              meta.publicMeta,
                              meta.privateMeta,
                              file.data.size
                          )
                      };
                  })
              )
            : [];

        const fileHandles = filesWithHandles.map(({ handle }) => handle);

        const inboxHandle = await api.prepareEntry(
            this._inboxId,
            entry.data,
            fileHandles,
            undefined
        );

        if (filesWithHandles.length > 0) {
            await Promise.all(filesWithHandles.map((file) => this.uploadFile(file, inboxHandle)));
        }

        await api.sendEntry(inboxHandle);
    }

    /**
     * Sends a file to an Inbox.
     *
     * @param {{name: string, data: Uint8Array, mimeType: string, handle: number}} fileWithHandle - The file with its handle to send.
     * @param {number} inboxHandle - The handle of the Inbox to which the file will be sent.
     * @returns {Promise<void>} - A promise that resolves when the file has been successfully sent to the Inbox.
     */

    private async uploadFile(
        fileWithHandle: {
            handle: number;
            data: Uint8Array | File;
        },
        inboxHandle: number
    ): Promise<void> {
        const api = await this.getApi();
        const inboxFileUploader = new InboxFileUploader(
            api,
            inboxHandle,
            fileWithHandle.handle,
            fileWithHandle.data,
            0
        );

        while (await inboxFileUploader.sendNextChunk());
    }

    /**
     * Gets a list of entries from current Inbox.
     * @param {number} pageIndex
     * @param {ListOptions} options optional {@link ListOptions `options`} object
     * @returns {Promise<PagingList<InboxEntry>>}  {@link PagingList `PagingList<InboxEntry>`}
     */

    public async listEntries(
        pageIndex?: number,
        options?: ListOptions
    ): Promise<PagingList<InboxEntry>> {
        const api = await this.getApi();

        const _options = {
            pageSize: 100,
            sort: 'desc',
            ...options
        } satisfies ListOptions;

        const _pageIndex = pageIndex ? pageIndex : 0;

        const inboxEntries = await api.listEntries(this._inboxId, {
            limit: _options.pageSize,
            skip: _options.pageSize * _pageIndex,
            sortOrder: _options.sort,
            lastId: _options.lastId
        });

        return inboxEntries;
    }

    /**
     * Gets an Inbox entry based on its ID
     * @param {InboxApi} api {@link InboxApi `InboxApi`}
     * @param {string} entryId Id of the entry
     * @returns {Promise<InboxEntry>} {@link InboxEntry `Promise<InboxEntry>`}
     */
    public static async getEntry(api: InboxApi, entryId: string): Promise<InboxEntry> {
        const inboxEntry = await api.readEntry(entryId);

        return inboxEntry;
    }

    /**
     * Deletes an entry from Inbox
     * @param {InboxApi} api {@link InboxApi `InboxApi`}
     * @param {string} entryId ID of entry to delete
     * @returns {Promise<void>}
     */
    public static async deleteEntry(api: InboxApi, entryId: string): Promise<void> {
        return await api.deleteEntry(entryId);
    }

    /**
     * Downloads file from Inbox to your local environment
     * @param {InboxApi} api {@link InboxApi `InboxApi`}
     * @param {StoreApi} storeApi {@link StoreApi `StoreApi`}
     * @param {object} file
     * @param {string} file.fileId File ID
     * @param {string} file.fileName optional name that will be assigned to the file
     * @param {function(number): void} [file.progressCallback] - Optional callback function to report progress
     *
     * @returns {Promise<void>} a promise that resolves with void and download the file to the browser environment
     */
    public static async downloadFile(
        api: InboxApi,
        storeApi: StoreApi,
        file: { fileId: string; fileName?: string; progressCallback?: (progress: number) => void }
    ): Promise<void> {
        const filename = file.fileName
            ? file.fileName
            : file.fileId.slice(0, file.fileId.length / 2);

        if ('showSaveFilePicker' in window) {
            return await this.chunkDownload(api, storeApi, {
                fileId: file.fileId,
                name: filename,
                progressCallback: file.progressCallback
            });
        }
        const data = await InboxClient.getFileContents(api, file.fileId, file.progressCallback);
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
        api: InboxApi,
        storeApi: StoreApi,
        file: { fileId: string; name: string; progressCallback?: (progress: number) => void }
    ) {
        const fileMeta = await storeApi.getFile(file.fileId);

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
     * Get the content of given file
     * @param {InboxApi} api {@link InboxApi `InboxApi`} instance
     * @param {string} fileId - ID of the file to get the content from
     * @param {function(number): void} progressCallback optional function to report progress
     * @returns {Promise<Uint8Array>} content of the file
     */
    static async getFileContents(
        api: InboxApi,
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
     * Reads a file and returns a stream handler along with its metadata.
     * @param {InboxApi} api {@link InboxApi `InboxApi`} instance
     * @param {string} fileId - The ID of the file to be read.
     * @returns {Promise<{streamReader: StreamReader, size: number, mimetype: string, name: string}>}
     * A promise that resolves with an object containing the stream reader, file size, MIME type, and file name.
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

    static async streamRead(api: InboxApi, fileId: string): Promise<StreamReader> {
        const handle = await api.openFile(fileId);
        const streamReader = new StreamReader(handle, api);

        return streamReader;
    }

    private getOn(eventDispatcher: EventDispatcher) {
        return <T extends EndpointApiEvent['type'] & EventsByChannel<'inboxEntries'>>(
            eventType: T,
            callback: (payload: Extract<EndpointApiEvent, { type: T }>) => void
        ) => {
            const removeEventListener = eventDispatcher.addEventListener(
                `inbox/${this.inboxId}/entries`,
                eventType,
                callback
            );
            const _on = this.getOn(eventDispatcher);

            return { on: _on, removeEventListener };
        };
    }

    /**
     * Subscribes to entry events on given Inbox:
     * - `inboxNewEntry`
     * - `inboxEntryDeleted`
     * @returns {Promise<SubscribeForChannel<'inboxEntries'>>} {@link SubscribeForChannel<'inboxEntries'> `Promise<SubscribeForChannel<'inboxEntries'>>`}
     */
    async subscribeForEntryEvents(): Promise<SubscribeForChannel<'inboxEntries'>> {
        const channel: Channel = `inbox/${this.inboxId}/entries`;
        if (!this._eventDispatcher.isSubscribedToChannel(channel)) {
            this._eventDispatcher.addChannelSubscription(channel);
            const api = await this.getApi();
            await api.subscribeForEntryEvents(this.inboxId);
        }

        const _on = this.getOn(this._eventDispatcher);

        return { on: _on };
    }

    /**
     * Unsubscribes from events related to entries on this Inbox
     * @returns {Promise<void>} a promise that resolves with void
     */
    async unsubscribeFromEntryEvents(): Promise<void> {
        const channel: Channel = `inbox/${this.inboxId}/entries`;
        if (this._eventDispatcher.isSubscribedToChannel(channel)) {
            return;
        }
        const api = await this.getApi();
        this._eventDispatcher.removeChannelSubscription(channel);

        return await api.unsubscribeFromEntryEvents(this.inboxId);
    }

    /**
     * Registers an event listener for Inbox entry-related events.
     *
     * @template T
     * @param {T & EventsByChannel<'inboxEntries'>} eventType - type of event to listen for.
     * @param {function(Extract<InboxEntryEvents, { type: T }>): void} callback - callback function to execute when the event occurs.
     * @returns {Promise<{on: SubscribeForChannel<'inboxEntries'>, removeEventListener: function() void}>} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener.
     */
    on<T extends EventsByChannel<'inboxEntries'>>(
        eventType: T,
        callback: (payload: Extract<InboxEntryEvents, { type: T }>) => void
    ): SubscribeForChannel<'inboxEntries'> & { removeEventListener: () => void } {
        if (!this._eventDispatcher.isSubscribedToChannel(`inbox/${this.inboxId}/entries`)) {
            console.warn(
                'You registered a event callback You are not subscribed to Inbox entry events.'
            );
        }

        const removeEventListener = this._eventDispatcher.addEventListener(
            `inbox/${this.inboxId}/entries`,
            eventType,
            callback
        );
        const _on = this.getOn(this._eventDispatcher);

        return { on: _on, removeEventListener };
    }

    private static getOn(eventDispatcher: EventDispatcher) {
        return <T extends EndpointApiEvent['type'] & EventsByChannel<'inbox'>>(
            eventType: T,
            callback: (payload: Extract<EndpointApiEvent, { type: T }>) => void
        ) => {
            const removeEventListener = eventDispatcher.addEventListener(
                'inbox',
                eventType,
                callback
            );
            const _on = InboxClient.getOn(eventDispatcher);

            return { on: _on, removeEventListener };
        };
    }

    /**
     * Subscribes to events related to inboxes:
     *  - `inboxCreated`
     *  - `inboxDeleted`
     *  - `inboxUpdated`
     * @param {InboxApi} api {@link InboxApi `InboxApi`}
     * @param {EventDispatcher} eventDispatcher {@link EventDispatcher eventDispatcher}
     * @returns {Promise<SubscribeForChannel<'inbox'>>} {@link SubscribeForChannel<'inbox'> `Promise<SubscribeForChannel<'inbox'>>`}
     */
    static async subscribeForInboxEvents(
        api: InboxApi,
        eventDispatcher: EventDispatcher
    ): Promise<SubscribeForChannel<'inbox'>> {
        const channel: Channel = 'inbox';
        if (!eventDispatcher.isSubscribedToChannel(channel)) {
            eventDispatcher.addChannelSubscription(channel);
            await api.subscribeForInboxEvents();
        }

        const on = InboxClient.getOn(eventDispatcher);

        return { on };
    }

    /**
     * Unsubscribes from Inbox related events on this Inbox
     * @param {InboxApi} api {@link InboxApi `InboxApi`}
     * @param {EventDispatcher} eventDispatcher {@link EventDispatcher eventDispatcher}
     * @returns {Promise<void>} a promise that resolves with void
     */
    static async unsubscribeFromInboxEvents(
        api: InboxApi,
        eventDispatcher: EventDispatcher
    ): Promise<void> {
        const channel: Channel = 'inbox';
        if (!eventDispatcher.isSubscribedToChannel(channel)) {
            return;
        }
        eventDispatcher.removeChannelSubscription('inbox');
        return await api.unsubscribeFromInboxEvents();
    }

    /**
     * Registers an event listener for Inbox-related events.
     *
     * @template T
     * @param {T & EventsByChannel<'inbox'>} eventType - type of event to listen for.
     * @param {function(Extract<InboxEvents, { type: T }>): void} callback - callback function to execute when the event occurs.
     * @returns {Promise<{on: SubscribeForChannel<'inbox'>, removeEventListener: function() void}>} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener.
     */
    static on<T extends EndpointApiEvent['type'] & EventsByChannel<'inbox'>>(
        eventDispatcher: EventDispatcher,
        eventType: T,
        callback: (payload: Extract<InboxEvents, { type: T }>) => void
    ): SubscribeForChannel<'inbox'> & { removeEventListener: () => void } {
        if (!eventDispatcher.isSubscribedToChannel('inbox')) {
            console.warn(
                'You registered a event callback, but you are not subscribed to Inbox events.'
            );
        }

        const removeEventListener = eventDispatcher.addEventListener('inbox', eventType, callback);
        const _on = this.getOn(eventDispatcher);

        return { on: _on, removeEventListener };
    }
}
