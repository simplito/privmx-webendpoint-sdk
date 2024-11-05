import { EventDispatcher } from '../../EventDispatcher';
import {
    EndpointApiEvent,
    FilesConfig,
    Inbox,
    InboxEntry,
    ListOptions,
    PagingList,
    UserWithPubKey
} from '../../types';
import { EventsByChannel, InboxEvents, SubscribeForChannel } from '../../types/events';
import { InboxClient } from '../InboxClient';
import { Endpoint } from '../Endpoint';

/**
 * Provides a wrapper for functions used to manage Inboxes in given Context.
 */
export class ContextInboxes {
    constructor(private _endpoint: Endpoint, private _eventDispatcher: EventDispatcher) {
    }

    /**
     * Lists Inboxes the user has access to.
     * @param {object} query
     * @param {string} query.contextId indicates from which Context should Inboxes be fetched
     * @param {number} query.pageIndex indicates from which page the list should start
     * @param {ListOptions=} query.options optional {@link ListOptions options} object
     * @returns {Promise<PagingList<Inbox>>} {@link PagingList `PagingList<Inbox>`}
     */
    async list(query: {
        contextId: string;
        pageIndex?: number;
        options?: ListOptions;
    }): Promise<PagingList<Inbox>> {
        const api = await this._endpoint.getInboxApi();

        return await InboxClient.getInboxes(api, query.contextId, query.pageIndex, query.options);
    }

    /**
     * Creates a new Inbox inside Context.
     * @param {object} newInbox
     * @param {string} newInbox.contextId - ID of the Context for the new Inbox
     * @param {UserWithPubKey[]} newInbox.users - list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access to the created Inbox
     * @param {UserWithPubKey[]} newInbox.managers - list of {@link UserWithPubKey `UserWithPubKey`} objects  which indicates who will have access (and management rights) to the created Inbox
     * @param {Uint8Array} newInbox.publicMeta - optional (unencrypted) public Inbox metadata
     * @param {Uint8Array} newInbox.privateMeta - optional (encrypted) private Inbox metadata
     * @param {FilesConfig} newInbox.filesConfig object to override default file configuration
     * @returns {Promise<string>} Created Inbox ID
     */

    async new(newInbox: {
        contextId: string;
        users: UserWithPubKey[];
        managers: UserWithPubKey[];
        publicMeta?: Uint8Array;
        privateMeta?: Uint8Array;
        filesConfig?: FilesConfig;
    }) {
        const api = await this._endpoint.getInboxApi();

        return await InboxClient.createInbox(api, {
            ...newInbox
        });
    }

    /**
     * Gets an Inbox entry based on its ID.
     * @param {string} entryId ID of the entry
     * @returns {Promise<InboxEntry>} {@link InboxEntry `Promise<InboxEntry>`}
     */
    async getEntry(entryId: string): Promise<InboxEntry> {
        const api = await this._endpoint.getInboxApi();
        const inboxEntry = await api.readEntry(entryId);

        return inboxEntry;
    }

    /**
     * Deletes an Inbox entry based on its ID.
     * @param {string} entryId ID of the entry
     * @returns {Promise<InboxEntry>} {@link InboxEntry `Promise<InboxEntry>`}
     */
    async deleteEntry(entryId: string): Promise<void> {
        const api = await this._endpoint.getInboxApi();
        return await api.deleteEntry(entryId);
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
        const api = await this._endpoint.getInboxApi();
        return InboxClient.getFileContents(api, fileId, progressCallback);
    }

    /**
     * Downloads file from Inbox to your local environment.
     *
     * On platforms that support FileAPI 'showFilePicker' method it will fetch file in chunks. Otherwise, the file will be downloaded to memory first.
     *
     * @param {object} file
     * @param {string} file.fileId File ID
     * @param {string} file.fileName optional name that will be assigned to the file
     * @param {function(number): void} [file.progressCallback] optional callback function called after fetching each file chunk
     */
    async downloadFile(file: {
        fileId: string;
        fileName?: string;
        progressCallback?: (progress: number) => void;
    }): Promise<void> {
        const storeApi = await this._endpoint.getStoreApi();
        const inboxApi = await this._endpoint.getInboxApi();
        return await InboxClient.downloadFile(inboxApi, storeApi, {
            fileId: file.fileId,
            fileName: file.fileName,
            progressCallback: file.progressCallback
        });
    }

    /**
     * Subscribes to events related to Inboxes:
     *  - `inboxCreated`
     *  - `inboxDeleted`
     *  - `inboxStatsChanged`
     *  - `inboxUpdated`
     * @returns {Promise<SubscribeForChannel<'inbox'>>} {@link SubscribeForChannel<'inbox'> `Promise<SubscribeForChannel<'inbox'>>`}
     */
    async subscribeForInboxEvents(): Promise<SubscribeForChannel<'inbox'>> {
        const api = await this._endpoint.getInboxApi();

        return await InboxClient.subscribeForInboxEvents(api, this._eventDispatcher);
    }

    /**
     * Unsubscribes and removes all registered callbacks for events related to Inboxes
     * @returns {Promise<void>}
     */
    async unsubscribeFromInboxEvents(): Promise<void> {
        const api = await this._endpoint.getInboxApi();
        return await InboxClient.unsubscribeFromInboxEvents(api, this._eventDispatcher);
    }

    /**
     * Registers an event listener for Inbox-related events.
     *
     * @template T
     * @param {T & EventsByChannel<'inbox'>} eventType - type of event to listen for
     * @param {function(Extract<EndpointApiEvent, { type: T }>): void} callback - callback function to execute when the event occurs
     * @returns {SubscribeForChannel<'inbox'> & {removeEventListener: () => void}} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener
     */
    on<T extends EndpointApiEvent['type'] & EventsByChannel<'inbox'>>(
        eventType: T,
        callback: (payload: Extract<InboxEvents, { type: T }>) => void
    ): SubscribeForChannel<'inbox'> & { removeEventListener: () => void } {
        return InboxClient.on(this._eventDispatcher, eventType, callback);
    }
}
