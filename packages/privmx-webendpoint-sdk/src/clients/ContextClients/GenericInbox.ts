import { EndpointApiEvent, FilesConfig, Inbox, InboxEntry, ListOptions, PagingList, UserWithPubKey } from '../../types';
import { EventsByChannel, InboxEntryEvents, SubscribeForChannel } from '../../types/events';
import { InboxEntryPayload } from '../../types/inboxes';
import { InboxClient } from '../InboxClient';

export class GenericInbox {
    constructor(private _inboxClient: InboxClient) {
    }

    /**
     * Fetches inbox public meta.
     * @returns {Promise<InboxPublicView>}
     */
    async publicView() {
        return await this._inboxClient.getPublicView();
    }

    /**
     * Fetches info about Inbox.
     * @returns {Promise<Inbox>} information about Inbox
     */
    async info(): Promise<Inbox> {
        return await this._inboxClient.getInboxInfo();
    }

    /**
     * Updates Inbox by overriding fields with new ones.
     * When updating, Bridge will check version number. Updates of Inbox with different
     * version number will be rejected.
     * Version number is incremented after every update.
     *
     * @param {object} updatedData
     * @param {UserWithPubKey[]} updatedData.users list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access to the updated Inbox
     * @param {UserWithPubKey[]} updatedData.managers list of {@link UserWithPubKey `UserWithPubKey`} objects  which indicates who will have access (and management rights) to the updated Inbox
     * @param {Uint8Array} updatedData.publicMeta (unencrypted) public Inbox metadata
     * @param {Uint8Array} updatedData.privateMeta (encrypted) private Inbox metadata
     * @param {FilesConfig | undefined} updatedData.filesConfig object to override default file configuration. Provide undefined if you want to leave the default configuration.
     * @param {number} updatedData.version current version of the updated Inbox
     * @param {boolean} [updatedData.options.force] - optional flag to generate a new key ID for the Inbox
     * @param {boolean} [updatedData.options.forceGenerateNewKey] - optional flag to allow new users to access old data
     * @returns {Promise<void>} a promise that resolves with void
     */
    async update(updatedData: {
        users: UserWithPubKey[];
        managers: UserWithPubKey[];
        publicMeta?: Uint8Array;
        privateMeta?: Uint8Array;
        filesConfig?: FilesConfig;
        version: number;
        options?: {
            force?: boolean;
            forceGenerateNewKey?: boolean;
        };
    }) {
        return await this._inboxClient.updateInbox(updatedData);
    }

    /**
     * Deletes Inbox
     * @returns {Promise<void>}
     */
    async delete(): Promise<void> {
        return await this._inboxClient.deleteInbox();
    }

    /**
     * Sends data and optional files to an Inbox.
     *
     * @param {InboxEntryPayload} entry Inbox entry object
     * @returns {Promise<void>}
     */

    async sendData(entry: InboxEntryPayload): Promise<void> {
        return await this._inboxClient.sendData(entry);
    }

    /**
     * Gets a list of entries from current Inbox.
     * @param {number} pageIndex indicates from which page the list should start
     * @param {ListOptions} options optional {@link ListOptions `options`} object
     * @returns {Promise<PagingList<InboxEntry>>}  {@link PagingList `PagingList<InboxEntry>`}
     */

    async listEntries(pageIndex?: number, options?: ListOptions): Promise<PagingList<InboxEntry>> {
        return await this._inboxClient.listEntries(pageIndex, options);
    }

    /**
     * Gets ID of Inbox
     */
    get inboxId(): string {
        return this._inboxClient.inboxId;
    }

    /**
     * Subscribes to entry events on given Inbox:
     * - `inboxNewEntry`
     * - `inboxEntryDeleted`
     * @returns {Promise<SubscribeForChannel<'inboxEntries'>>} {@link SubscribeForChannel<'inboxEntries'> `Promise<SubscribeForChannel<'inboxEntries'>>`}
     */
    async subscribeForEntryEvents(): Promise<SubscribeForChannel<'inboxEntries'>> {
        return await this._inboxClient.subscribeForEntryEvents();
    }

    /**
     * Unsubscribes and removes all registered callbacks from events related to entries in this Inbox.
     * @returns {Promise<void>} a promise that resolves with void
     */
    async unsubscribeFromEntryEvents(): Promise<void> {
        return await this._inboxClient.unsubscribeFromEntryEvents();
    }

    /**
     * Registers an event listener for Inbox entry-related events.
     *
     * @template T
     * @param {T & EventsByChannel<'inboxEntries'>} eventType - type of event to listen for.
     * @param {function(Extract<InboxEntryEvents, { type: T }>): void} callback - callback function to execute when the event occurs
     * @returns {Promise<{on: SubscribeForChannel<'inboxEntries'>, removeEventListener: function() void}>} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener
     */
    on<T extends EndpointApiEvent['type'] & EventsByChannel<'inboxEntries'>>(
        eventType: T,
        callback: (payload: Extract<InboxEntryEvents, { type: T }>) => void
    ): SubscribeForChannel<'inboxEntries'> & { removeEventListener: () => void } {
        return this._inboxClient.on(eventType, callback);
    }
}
