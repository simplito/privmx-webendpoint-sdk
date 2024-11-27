import { ListOptions, Message, PagingList, Thread, UserWithPubKey } from '../../types';
import { EventsByChannel, SubscribeForChannel, ThreadMessageEvents } from '../../types/events';
import { ThreadMessagePayload } from '../../types/thread';
import { ThreadClient } from '../ThreadClient';

export class GenericThread {
    constructor(private _threadClient: ThreadClient) {}

    /**
     * Deletes Thread.
     * @returns {Promise<void>}
     */
    async delete(): Promise<void> {
        return await this._threadClient.deleteThread();
    }

    /**
     * Fetches info about Thread.
     * @returns {Promise<Thread>} {@link Thread `Thread`} object
     */
    async info(): Promise<Thread> {
        return await this._threadClient.getThreadInfo();
    }

    /**
     * Updates Thread by overriding fields with new ones.
     * While updating, the Bridge will check version number. Updates of Thread with different
     * version number will be rejected.
     * Version number is incremented after every update.
     *
     * @param {Object} updatedData
     * @param {UserWithPubKey[]} updatedData.users - list of users with access to the Thread
     * @param {UserWithPubKey[]} updatedData.managers - list of users with permissions to modify the Thread
     * @param {Uint8Array} updatedData.publicMeta  public (unencrypted) metadata
     * @param {Uint8Array} updatedData.privateMeta  (encrypted) metadata
     * @param {Object} updatedData.options
     * @param {boolean} [updatedData.options.force] - optional flag to generate a new key ID for the Thread
     * @param {boolean} [updatedData.options.forceGenerateNewKey] - optional flag allowing new users to access old data
     *
     * @returns {Promise<void>} void
     */
    async update(updatedData: {
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
        return await this._threadClient.updateThread(updatedData);
    }

    /**
     * Returns a list of messages inside Thread.
     * @param {number} pageIndex
     * @param {ListOptions} options optional {@link ListOptions options} object
     * @returns {Promise<PagingList<Message>>}  {@link PagingList `PagingList<Message>`}
     */
    async getMessages(pageIndex?: number, options?: ListOptions): Promise<PagingList<Message>> {
        return await this._threadClient.getMessages(pageIndex, options);
    }

    /**
     * Sends a message to Thread.
     * @param {ThreadMessagePayload} newMessage {@link ThreadMessagePayload `ThreadMessagePayload`}
     * @returns {Promise<string>} Id of new message
     *
     */
    async sendMessage(newMessage: ThreadMessagePayload): Promise<string> {
        return await this._threadClient.sendMessage(newMessage);
    }

    /**
     * Subscribes to message events in given Thread:
     * - `threadNewMessage`
     * - `threadMessageDeleted`
     * - `threadMessageUpdated`
     * @returns  {Promise<SubscribeForChannel<'threadMessages'>>} {@link SubscribeForChannel<'threadMessages'> `Promise<SubscribeForChannel<'threadMessages'>>`}
     */
    async subscribeToMessageEvents(): Promise<SubscribeForChannel<'threadMessages'>> {
        return await this._threadClient.subscribeToMessageEvents();
    }

    /**
     * Unsubscribes and removes all callbacks from message-related events in the Thread.
     * @returns {Promise<void>} a promise that resolves with void
     */
    async unsubscribeFromMessageEvents(): Promise<void> {
        return await this._threadClient.unsubscribeFromMessageEvents();
    }

    /**
     * Returns ID of Thread.
     * @returns {string} ID of current Thread
     */
    id(): string {
        return this._threadClient.threadId;
    }

    /**
     * Registers an event listener for Thread message-related events.
     *
     * @template T
     * @param {T & EventsByChannel<'threadMessages'>} eventType - type of event to listen for
     * @param {function(Extract<EndpointApiEvent, { type: T }>): void} callback - callback function to execute when the event occurs
     * @returns {Promise<{on: SubscribeForChannel<'threadMessages'>, removeEventListener: function() void}>} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener
     */
    on<T extends EventsByChannel<'threadMessages'>>(
        eventType: T,
        callback: (payload: Extract<ThreadMessageEvents, { type: T }>) => void
    ): SubscribeForChannel<'threadMessages'> & { removeEventListener: () => void } {
        return this._threadClient.on(eventType, callback);
    }
}
