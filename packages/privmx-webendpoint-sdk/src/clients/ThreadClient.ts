import { ThreadApi } from '../api/thread/ThreadApi';
import { EventDispatcher } from '../EventDispatcher';
import { EndpointApiEvent, ListOptions, Message, PagingList, Thread } from '../types';
import {
    Channel,
    EventsByChannel,
    SubscribeForChannel,
    ThreadEvents,
    ThreadMessageEvents
} from '../types/events';
import { Endpoint } from './Endpoint';
import { CreateThreadPayload, ThreadMessagePayload, UpdateThreadPayload } from '../types/thread';

/**
 * Helper wrapper around raw Wasm bindings. Manages all the necessary IDs exposing high level Threads API.
 *
 */
export class ThreadClient {
    private _threadId: string;
    get threadId(): string {
        return this._threadId;
    }

    private _endpoint: Endpoint;
    private _eventDispatcher: EventDispatcher;

    /**
     * @param {string} threadId
     * @param {Endpoint} platform {@link Endpoint `Endpoint`} instance
     *
     */
    constructor(threadId: string, platform: Endpoint, eventDispatcher: EventDispatcher) {
        this._threadId = threadId;
        this._endpoint = platform;
        this._eventDispatcher = eventDispatcher;
    }

    /**
     * Gets Thread API from current Endpoint instance.
     * @returns {Promise<ThreadApi>} {@link ThreadApi `Promise<ThreadApi>`}
     */
    private async getApi(): Promise<ThreadApi> {
        return await this._endpoint.getThreadApi();
    }

    /**
     * Creates a new Thread in current Context.
     * @param {ThreadApi} threadApi {@link ThreadApi `ThreadApi`} instance
     * @param {Object} newThread
     * @param {UserWithPubKey[]} newThread.users list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access to the updated Thread
     * @param {UserWithPubKey[]} newThread.managers list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access (and management rights) to the updated Thread
     * @param {Uint8Array} newThread.publicMeta - public metadata of the Thread
     * @param {Uint8Array} newThread.privateMeta - private metadata of the Thread
     * @returns {Promise<string>} promise of newly created Thread ID
     */
    static async createThread(
        threadApi: ThreadApi,
        newThread: CreateThreadPayload
    ): Promise<string> {
        const meta = {
            publicMeta: newThread.publicMeta || new Uint8Array(),
            privateMeta: newThread.privateMeta || new Uint8Array()
        };

        const newThreadId = await threadApi.createThread(
            newThread.contextId,
            newThread.users,
            newThread.managers,
            meta.publicMeta,
            meta.privateMeta
        );

        return newThreadId;
    }

    /**
     * Returns a list of Threads in given Context.
     * @param {ThreadApi} threadApi {@link ThreadApi `ThreadApi`} instance
     * @param {string} contextId - ID of the Context to get Threads from
     * @param {number} pageIndex
     * @param {ListOptions} options optional {@link ListOptions `options`} object
     * @returns {Promise<PagingList<Thread>>} - promise of {@link PagingList `PagingList<Thread>`}
     */
    static async getThreads(
        threadApi: ThreadApi,
        contextId: string,
        pageIndex?: number,
        options?: ListOptions
    ): Promise<PagingList<Thread>> {
        const _options = {
            pageSize: 100,
            sort: 'desc',
            ...options
        } satisfies ListOptions;

        const _pageIndex = pageIndex ? pageIndex : 0;

        const threadsList = await threadApi.listThreads(contextId, {
            limit: _options.pageSize,
            skip: _pageIndex * _options.pageSize,
            sortOrder: _options.sort,
            lastId: _options.lastId
        });

        return threadsList;
    }

    /**
     * Fetches info about current Thread.
     * @returns {Promise<Thread>} {@link Thread `Thread`} object
     */
    async getThreadInfo(): Promise<Thread> {
        const api = await this.getApi();
        const threadInfo = await api.getThread(this._threadId);
        return threadInfo;
    }

    /**
     * Updates Thread by overriding fields with new ones.
     * While updating, the server will check version number. Updates of Thread with different
     * version number will be rejected.
     * Version number is incremented after every update.
     *
     * @param {Object} updatedData
     * @param {UserWithPubKey[]} updatedData.users - list of users with access to the Thread
     * @param {UserWithPubKey[]} updatedData.managers - list of users with permissions to modify the Thread
     * @param {Uint8Array} updatedData.publicMeta  public (unencrypted) metadata
     * @param {Uint8Array} updatedData.privateMeta  (encrypted) metadata
     * @param {Object=} [updatedData.options]
     * @param {boolean} [updatedData.options.force] - optional flag to generate a new key ID for the Thread
     * @param {boolean} [updatedData.options.forceGenerateNewKey] - optional flag allowing new users to access old data
     */
    async updateThread(updatedData: UpdateThreadPayload) {
        const api = await this.getApi();

        const meta = {
            publicMeta: updatedData.publicMeta || new Uint8Array(),
            privateMeta: updatedData.privateMeta || new Uint8Array()
        };

        return await api.updateThread(
            this._threadId,
            updatedData.users,
            updatedData.managers,
            meta.publicMeta,
            meta.privateMeta,
            updatedData.version,
            updatedData.options?.force || false,
            updatedData.options?.forceGenerateNewKey || false
        );
    }

    /**
     * Deletes current Thread from Context.
     * @returns {Promise<void>} a promise that resolves with void
     */
    async deleteThread(): Promise<void> {
        const api = await this.getApi();
        await api.deleteThread(this._threadId);
    }

    /**
     * Sends a message to Thread.
     * @param {ThreadMessagePayload} newMessage - {@link ThreadMessagePayload `ThreadMessagePayload`}
     * @returns {Promise<string>} promise of new messages's `messageId`
     */
    public async sendMessage(newMessage: ThreadMessagePayload): Promise<string> {
        const api = await this.getApi();

        const meta = {
            publicMeta: newMessage.publicMeta || new Uint8Array(),
            privateMeta: newMessage.privateMeta || new Uint8Array()
        };

        const threadMessageId = await api.sendMessage(
            this._threadId,
            meta.publicMeta,
            meta.privateMeta,
            newMessage.data
        );

        return threadMessageId;
    }

    /**
     * Returns list of messages inside Thread.
     * @param {number} pageIndex
     * @param {ListOptions} options optional {@link ListOptions options} object
     * @returns {Promise<PagingList<Message>>}  {@link PagingList `PagingList<Message>`}
     */
    public async getMessages(
        pageIndex?: number,
        options?: ListOptions
    ): Promise<PagingList<Message>> {
        const _options = {
            pageSize: 100,
            sort: 'desc',
            ...options
        } satisfies ListOptions;
        const _pageIndex = pageIndex ? pageIndex : 0;

        const api = await this.getApi();

        const threadMessages = await api.listMessages(this._threadId, {
            limit: _options.pageSize,
            skip: _pageIndex * _options.pageSize,
            sortOrder: _options.sort,
            lastId: _options.lastId
        });

        return threadMessages;
    }

    /**
     * Returns message with matching `messageId`.
     * @param {ThreadApi} threadApi {@link ThreadApi `ThreadApi`} instance
     * @param {string} messageId ID of the message to get
     * @returns {Promise<Message>} {@link Message `Promise<Message>`}
     */
    static async getMessage(threadApi: ThreadApi, messageId: string): Promise<Message> {
        const message = await threadApi.getMessage(messageId);

        return message;
    }

    /**
     * Deletes message with matching `messageId`.
     * @param {ThreadApi} threadApi {@link ThreadApi `ThreadApi`} instance
     * @param {string} messageId ID of message to delete
     * @returns {Promise<void>} a promise that resolves with void
     */
    static async deleteMessage(threadApi: ThreadApi, messageId: string): Promise<void> {
        return await threadApi.deleteMessage(messageId);
    }

    private getOn(eventDispatcher: EventDispatcher) {
        return <T extends EndpointApiEvent['type'] & EventsByChannel<'threadMessages'>>(
            eventType: T,
            callback: (payload: Extract<EndpointApiEvent, { type: T }>) => void
        ) => {
            const removeEventListener = eventDispatcher.addEventListener(
                `thread/${this.threadId}/messages`,
                eventType,
                callback
            );
            const _on = this.getOn(eventDispatcher);

            return { on: _on, removeEventListener };
        };
    }

    /**
     * Subscribes to message events in given Thread:
     * - `threadNewMessage`
     * - `threadMessageDeleted`
     * - `threadMessageUpdated`
     * @returns  {Promise<SubscribeForChannel<'threadMessages'>>} {@link SubscribeForChannel<'threadMessages'> `Promise<SubscribeForChannel<'threadMessages'>>`}
     */
    async subscribeToMessageEvents(): Promise<SubscribeForChannel<'threadMessages'>> {
        const channel: Channel = `thread/${this.threadId}/messages`;
        if (!this._eventDispatcher.isSubscribedToChannel(channel)) {
            const api = await this.getApi();
            this._eventDispatcher.addChannelSubscription(channel);
            await api.subscribeForMessageEvents(this._threadId);
        }

        const _on = this.getOn(this._eventDispatcher);

        return { on: _on };
    }

    /**
     * Unsubscribes from  message-related events in the Thread.
     * @returns {Promise<void>} a promise that resolves with void
     */
    async unsubscribeFromMessageEvents(): Promise<void> {
        const channel: Channel = `thread/${this.threadId}/messages`;
        if (!this._eventDispatcher.isSubscribedToChannel(channel)) {
            return;
        }
        const api = await this.getApi();
        this._eventDispatcher.removeChannelSubscription(channel);
        return await api.unsubscribeFromMessageEvents(this._threadId);
    }

    /**
     * Registers an event listener for Thread message-related events.
     *
     * @template T
     * @param {T & EventsByChannel<'threadMessages'>} eventType - type of event to listen for
     * @param {function(Extract<EndpointApiEvent, { type: T }>): void} callback - callback function to execute when the event occurs
     * @returns {Promise<{on: SubscribeForChannel<'threadMessages'>, removeEventListener: function() void}>} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener
     */
    on<T extends EndpointApiEvent['type'] & EventsByChannel<'threadMessages'>>(
        eventType: T,
        callback: (payload: Extract<ThreadMessageEvents, { type: T }>) => void
    ): SubscribeForChannel<'threadMessages'> & { removeEventListener: () => void } {
        if (!this._eventDispatcher.isSubscribedToChannel(`thread/${this._threadId}/messages`)) {
            console.warn(
                'You registered a event callback You are not subscribed to thread message events.'
            );
        }

        const removeEventListener = this._eventDispatcher.addEventListener(
            `thread/${this._threadId}/messages`,
            eventType,
            callback
        );
        const _on = this.getOn(this._eventDispatcher);

        return { on: _on, removeEventListener };
    }

    private static getOn(eventDispatcher: EventDispatcher) {
        return <T extends EndpointApiEvent['type'] & EventsByChannel<'thread'>>(
            eventType: T,
            callback: (payload: Extract<EndpointApiEvent, { type: T }>) => void
        ) => {
            const removeEventListener = eventDispatcher.addEventListener(
                'thread',
                eventType,
                callback
            );
            const _on = ThreadClient.getOn(eventDispatcher);

            return { on: _on, removeEventListener };
        };
    }

    /**
     * Subscribes to events related to Threads:
     *  - `threadCreated`
     *  - `threadDeleted`
     *  - `threadStatsChanged`
     *  - `threadUpdated`
     * @param {ThreadApi} api - instance of Thread API
     * @param {EventDispatcher} eventDispatcher {@link EventDispatcher eventDispatcher}
     * @returns {Promise<SubscribeForChannel<'thread'>>} {@link SubscribeForChannel `SubscribeForChannel<'thread'>`}
     */
    static async subscribeToThreadEvents(
        api: ThreadApi,
        eventDispatcher: EventDispatcher
    ): Promise<SubscribeForChannel<'thread'>> {
        const channel: Channel = 'thread';
        if (!eventDispatcher.isSubscribedToChannel(channel)) {
            eventDispatcher.addChannelSubscription(channel);
            await api.subscribeForThreadEvents();
        }
        const on = ThreadClient.getOn(eventDispatcher);

        return { on };
    }

    /**
     * Unsubscribes from events related to the Thread.
     *
     * @param {ThreadApi} threadApi - instance of Thread API
     * @param {EventDispatcher} eventDispatcher {@link EventDispatcher eventDispatcher}
     * @returns {Promise<void>} a promise that resolves with void
     */
    static async unsubscribeFromThreadEvents(
        threadApi: ThreadApi,
        eventDispatcher: EventDispatcher
    ): Promise<void> {
        const channel: Channel = 'thread';
        if (!eventDispatcher.isSubscribedToChannel(channel)) {
            return;
        }
        eventDispatcher.removeChannelSubscription(channel);
        return await threadApi.unsubscribeFromThreadEvents();
    }

    /**
     * Registers an event listener for Thread-related events.
     *
     * @template T
     * @param {T & EventsByChannel<'thread'>} eventType - type of event to listen for
     * @param {function(Extract<EndpointApiEvent, { type: T }>): void} callback - callback function to execute when the event occurs
     * @returns {Promise<{on: SubscribeForChannel<'thread'>, removeEventListener: function() void}>} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener
     */
    static on<T extends EndpointApiEvent['type'] & EventsByChannel<'thread'>>(
        eventDispatcher: EventDispatcher,
        eventType: T,
        callback: (payload: Extract<ThreadEvents, { type: T }>) => void
    ): SubscribeForChannel<'thread'> & { removeEventListener: () => void } {
        if (!eventDispatcher.isSubscribedToChannel('thread')) {
            console.warn(
                'You registered an event callback, but you are not subscribed to thread events.'
            );
        }

        const removeEventListener = eventDispatcher.addEventListener('thread', eventType, callback);
        const _on = this.getOn(eventDispatcher);

        return { on: _on, removeEventListener };
    }
}
