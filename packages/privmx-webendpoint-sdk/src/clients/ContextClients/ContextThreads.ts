import { EventDispatcher } from '../../EventDispatcher';
import { EndpointApiEvent, ListOptions, Message, PagingList, Thread, UserWithPubKey } from '../../types';
import { EventsByChannel, SubscribeForChannel, ThreadEvents, ThreadMessageEvents } from '../../types/events';
import { Endpoint } from '../Endpoint';
import { ThreadClient } from '../ThreadClient';

/**
 * Provides a wrapper for functions used to manage Threads in given Context.
 */
export class ContextThreads {
    constructor(private _endpoint: Endpoint, private _eventDispatcher: EventDispatcher) {
    }

    /**
     * Returns a list of Threads in given Context.
     * @param {object} query
     * @param {string} query.contextId - indicates from which Context should Threads be fetched
     * @param {number} query.pageIndex indicates from which page the list should start
     * @param {ListOptions} query.options optional {@link ListOptions `options`} object
     * @returns {Promise<PagingList<Thread>>} - promise of {@link PagingList `PagingList<Thread>`}
     */
    async list(query: {
        contextId: string;
        pageIndex?: number;
        options?: ListOptions;
    }): Promise<PagingList<Thread>> {
        const api = await this._endpoint.getThreadApi();
        return await ThreadClient.getThreads(api, query.contextId, query.pageIndex, query.options);
    }

    /**
     * Creates a new Thread inside Context.
     * @param {Object} newThread
     * @param {UserWithPubKey[]} newThread.users list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access to the updated Thread
     * @param {UserWithPubKey[]} newThread.managers list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access (and management rights) to the updated Thread
     * @param {Uint8Array} newThread.publicMeta - public metadata of the Thread
     * @param {Uint8Array} newThread.privateMeta - private metadata of the Thread
     * @returns {Promise<string>} - ID of created Thread
     */
    async new(newThread: {
        contextId: string;
        users: UserWithPubKey[];
        managers: UserWithPubKey[];
        publicMeta?: Uint8Array;
        privateMeta?: Uint8Array;
    }): Promise<string> {
        const api = await this._endpoint.getThreadApi();
        return await ThreadClient.createThread(api, {
            ...newThread
        });
    }

    /**
     * Returns message with matching `messageId`.
     * @param {string} messageId ID of the message to get
     * @returns {Promise<Message>} {@link Message `Promise<Message>`}
     */
    async getMessage(messageId: string): Promise<Message> {
        const api = await this._endpoint.getThreadApi();

        return await ThreadClient.getMessage(api, messageId);
    }

    /**
     * Deletes message with matching `messageId`.
     * @param {string} messageId ID of the message to delete
     * @returns {Promise<void>} a promise that resolves with void
     */
    async deleteMessage(messageId: string): Promise<void> {
        const api = await this._endpoint.getThreadApi();

        return await ThreadClient.deleteMessage(api, messageId);
    }

    /**
     * Subscribes to events related to Threads:
     *  - `threadCreated`
     *  - `threadDeleted`
     *  - `threadStatsChanged`
     *  - `threadUpdated`
     * @returns {Promise<SubscribeForChannel<'thread'>>} {@link SubscribeForChannel `SubscribeForChannel<'thread'>`}
     */
    async subscribeToThreadEvents(): Promise<SubscribeForChannel<'thread'>> {
        const api = await this._endpoint.getThreadApi();
        return await ThreadClient.subscribeToThreadEvents(api, this._eventDispatcher);
    }

    /**
     * Unsubscribes from events related to given Thread.
     * @returns {Promise<void>} a promise that resolves with void
     */
    async unsubscribeFromThreadEvents(): Promise<void> {
        const api = await this._endpoint.getThreadApi();
        return await ThreadClient.unsubscribeFromThreadEvents(api, this._eventDispatcher);
    }

    /**
     * Registers an event listener for Thread-related events.
     *
     * @template T
     * @param {T & EventsByChannel<'thread'>} eventType - type of event to listen for
     * @param {function(Extract<EndpointApiEvent, { type: T }>): void} callback - callback function to execute when the event occurs
     * @returns {Promise<{on: SubscribeForChannel<'thread'>, removeEventListener: function() void}>} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener
     */
    on<T extends EventsByChannel<'thread'>>(
        eventType: T,
        callback: (payload: Extract<ThreadEvents, { type: T }>) => void
    ): SubscribeForChannel<'thread'> & { removeEventListener: () => void } {
        return ThreadClient.on<T>(this._eventDispatcher, eventType, callback);
    }
}
