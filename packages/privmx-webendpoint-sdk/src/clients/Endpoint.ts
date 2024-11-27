import { EndpointApiEvent, EventsByChannel, SubscribeForChannel } from '../types/events';
import { EventDispatcher } from '../EventDispatcher';
import { Context, ListOptions, PagingList, SortOrder } from '../types/core';
import { Connection } from '../api/connection/Connection';
import { ThreadApi } from '../api/thread/ThreadApi';
import { StoreApi } from '../api/store/StoreApi';
import { InboxApi } from '../api/inbox/InboxApi';
import { EventQueue } from '../api/event-queue/EventQueue';
import { EndpointFactoryProvider } from '../EndpointFactory';
import { PublicConnection } from './PublicConnection';
import { ConnectionError } from '../errors/ConnectionError';

import {
    ContextInboxes,
    ContextStores,
    ContextThreads,
    GenericInbox,
    GenericStore,
    GenericThread
} from './ContextClients';
import { ThreadClient } from './ThreadClient';
import { StoreClient } from './StoreClient';
import { InboxClient } from './InboxClient';

/**
 * Wrapper class for Privmx Endpoint.
 *
 * @example
 * Connecting to Privmx Endpoint
 * ```js
 * const connection = await Endpoint.connect({
 *      bridgeUrl:BRIDGE_URL,
 *      solutionId:SOLUTION_ID,
 *      privKey:USER_PRIVATE_KEY
 * })
 * ```
 */
export class Endpoint {
    private static _connections: Map<string, Endpoint> = new Map<string, Endpoint>();
    private static _eventQueue: EventQueue;
    private static _isEventLoopRunning = false;
    private static _eventLoopId: number = -1;

    private _connectionType: 'public' | 'user' = 'user';

    /**
     * Returns the type of current connection.
     * @returns {string} `user` - when connected with `connect`, `public` - when connected with `connectPublic`
     */
    public connectionType(): 'public' | 'user' {
        return this._connectionType;
    }

    private _threadApiPromise: Promise<ThreadApi> | null = null;
    private _threadApi: ThreadApi | null = null;

    private _storeApiPromise: Promise<StoreApi> | null = null;
    private _storeApi: StoreApi | null = null;

    private _inboxApi: InboxApi | null = null;
    private _inboxApiPromise: Promise<InboxApi> | null = null;
    private _connectionId: string;
    private readonly _label: string;

    private readonly eventDispatcher: EventDispatcher;

    private static _defaultConnectionId: string = '';

    /**
     * @returns {string} default connection ID/label which is called by `connection()` and `connectionPublic()` when no label is passed
     */
    public static getDefaultConnectionId(): string {
        return this._defaultConnectionId;
    }

    /**
     * Sets the default connection ID.
     * @param {string} id
     */
    public static setDefaultConnectionId(id: string) {
        this._defaultConnectionId = id;
    }

    constructor(
        private _coreApi: Connection,
        connectionId: string,
        label: string
    ) {
        this.eventDispatcher = new EventDispatcher();
        this._connectionId = connectionId;
        this._label = label ? label : connectionId;
    }

    /**
     * Connects to Bridge using provided config.
     * @param {object} connectionConfig
     * @param {string} connectionConfig.bridgeUrl - URL of PrivMX Bridge instance
     * @param {string} connectionConfig.solutionId - ID of Solution to connect to
     * @param {string} connectionConfig.privKey - Private Key in WIF format; you have to register their Private Key before users can connect to Bridge
     * @param {string} connectionConfig.label - optional label to set if you're using multiple connections; if you're not - `connectionId` will be used by default
     * @returns {Promise<Endpoint>} {@link Endpoint `Promise<Endpoint>`}
     */
    static async connect(connectionConfig: {
        bridgeUrl: string;
        privKey: string;
        solutionId: string;
        label?: string;
    }): Promise<Endpoint> {
        const coreApi = await EndpointFactoryProvider.platformConnect(
            connectionConfig.privKey,
            connectionConfig.solutionId,
            connectionConfig.bridgeUrl
        );

        const connectionId = await coreApi.getConnectionId();
        let label: string;

        if (connectionConfig.label) {
            label = connectionConfig.label;
        } else {
            label = connectionId;
            Endpoint._defaultConnectionId = connectionId;
        }

        const conn = new Endpoint(coreApi, connectionId, label);
        conn._connectionType = 'user';
        Endpoint._connections.set(label, conn);

        return Endpoint.connection(label);
    }

    /**
     * Connects to the Bridge publicly using provided config.
     * This method of connecting to PrivMX Bridge doesn't require registering private keys earlier, they are created while connecting.
     * Public connection exposes limited set of Endpoint method.
     * @param {object} connectionConfig
     * @param {string} connectionConfig.bridgeUrl - URL of PrivMX Bridge instance
     * @param {string} connectionConfig.solutionId - ID of Solution to connect to
     * @param {string} connectionConfig.label - optional label to set if you're using multiple connections; if you're not - `connectionId` will be used by default
     * @returns {Promise<Endpoint>} {@link Endpoint `Promise<Endpoint>`}
     */
    static async connectPublic(connectionConfig: {
        bridgeUrl: string;
        solutionId: string;
        label?: string;
    }) {
        const coreApi = await EndpointFactoryProvider.platformConnectPublic(
            connectionConfig.solutionId,
            connectionConfig.bridgeUrl
        );
        const connectionId = await coreApi.getConnectionId();
        let label: string;

        if (connectionConfig.label) {
            label = connectionConfig.label;
        } else {
            label = connectionId;
            Endpoint._defaultConnectionId = connectionId;
        }
        const conn = new Endpoint(coreApi, connectionId, label);
        conn._connectionType = 'public';
        Endpoint._connections.set(label, conn);

        return Endpoint.publicConnection(label);
    }

    /**
     * Function for getting current active connection.
     * @param {string=} label optional label passed during `Endpoint.connect`
     * @returns {Endpoint}
     *
     * @throws {@link ConnectionError} -Thrown when there is no current connection
     * @throws {@link ConnectionError} -Thrown when user uses public connection
     */
    static connection(label?: string): Endpoint {
        const passedLabel = label ? label : Endpoint._defaultConnectionId;

        const connection = Endpoint._connections.get(passedLabel);

        if (!connection) {
            throw new ConnectionError('No active connection', 1);
        }

        if (connection.connectionType() === 'public') {
            throw new ConnectionError(
                'Used connection() in an public connection. Use publicConnection()',
                2
            );
        }
        return connection;
    }

    /**
     * Returns a wrapper for functions that can be used in a public(guest) connection.
     * @returns {PublicConnection} {@link PublicConnection `AnonymousConnection` }
     *
     * @throws {@link ConnectionError} Thrown when used for getting normal connection (created using `Endpoint.connect` instead of `Endpoint.connectPublic`)
     * @throws {@link ConnectionError} Thrown when there is no current public connection
     */
    static publicConnection(label?: string): PublicConnection {
        const passedLabel = label ? label : Endpoint._defaultConnectionId;

        const connection = Endpoint._connections.get(passedLabel);

        if (!connection) {
            throw new ConnectionError('No active connection', 3);
        }

        if (connection.connectionType() === 'user') {
            throw new ConnectionError(
                'Used publicConnection() in an userConnection. Use connection()',
                4
            );
        }

        return new PublicConnection(connection);
    }

    /**
     * Provides functions to manage Threads.
     *
     * @returns {ContextThreads} {@link ContextThreads `ContextThread`}
     */
    get threads(): ContextThreads {
        if (this.connectionType() === 'public') {
            throw new Error(
                'In a public(guest) connection you should use the `publicConnection` function to get access to Endpoint methods'
            );
        }

        return new ContextThreads(this, this.eventDispatcher);
    }

    /**
     * Provides a wrapper to manage given Thread.
     * @param {string} threadId - ID of the Thread
     *
     * @returns {GenericThread} {@link GenericThread `GenericThread`}
     * @throws {@link ConnectionError} Thrown when used for getting normal connection (created using `Endpoint.connect` instead of `Endpoint.connectPublic`)
     */
    thread(threadId: string): GenericThread {
        if (this.connectionType() === 'public') {
            throw new Error(
                'In a public(guest) connection you should use the `publicConnection` function to get access to Endpoint methods'
            );
        }
        const client = new ThreadClient(threadId, this, this.eventDispatcher);
        return new GenericThread(client);
    }

    /**
     * Provides functions to manage Stores.
     *
     * @returns {ContextStores} {@link ContextStores `ContextStores`}
     */
    get stores(): ContextStores {
        if (this.connectionType() === 'public') {
            throw new Error(
                'In a public(guest) connection you should use the `publicConnection` function to get access to Endpoint methods'
            );
        }
        return new ContextStores(this, this.eventDispatcher);
    }

    /**
     * Provides a wrapper to manage a given Store.
     * @param {string} storeId - ID of the Store
     *
     * @returns {GenericStore} {@link GenericStore `GenericStore`}
     */
    store(storeId: string): GenericStore {
        if (this.connectionType() === 'public') {
            throw new Error(
                'In a public(guest) connection you should use the `publicConnection` function to get access to Endpoint methods'
            );
        }
        return new GenericStore(new StoreClient(storeId, this, this.eventDispatcher));
    }

    /**
     * Provides functions to manage Inboxes.
     *
     * @returns {ContextInboxes} {@link ContextInboxes `ContextInboxes`}
     */
    get inboxes(): ContextInboxes {
        if (this.connectionType() === 'public') {
            throw new Error(
                'In a public(guest) connection you should use the `publicConnection` function to get access to Endpoint methods'
            );
        }
        return new ContextInboxes(this, this.eventDispatcher);
    }

    /**
     * Provides a wrapper to manage given Inbox.
     * @param {string} inboxId - ID of the Inbox
     *
     * @returns {GenericInbox} {@link GenericInbox `GenericInbox`}
     */
    inbox(inboxId: string): GenericInbox {
        if (this.connectionType() === 'public') {
            throw new Error(
                'In a public(guest) connection you should use the `publicConnection` function to get access to Endpoint methods'
            );
        }
        return new GenericInbox(new InboxClient(inboxId, this, this.eventDispatcher));
    }

    /**
     * Gets instance of ThreadApi associated with current connection.
     * @returns {Promise<ThreadApi>} {@link ThreadApi `Promise<ThreadApi>`}
     */
    async getThreadApi(): Promise<ThreadApi> {
        if (this._threadApi) {
            return this._threadApi;
        }

        if (!this._threadApiPromise) {
            this._threadApiPromise = EndpointFactoryProvider.createThreadApi(this._coreApi).then(
                (threadApi) => {
                    this._threadApi = threadApi;
                    this._threadApiPromise = null;

                    return threadApi;
                }
            );
        }

        return this._threadApiPromise;
    }

    /**
     * Gets instance of StoreApi associated with current connection.
     * @returns {Promise<StoreApi>} {@link StoreApi Promise<`StoreApi`>}
     */
    async getStoreApi(): Promise<StoreApi> {
        if (this._storeApi) {
            return this._storeApi;
        }

        if (!this._storeApiPromise) {
            this._storeApiPromise = EndpointFactoryProvider.createStoreApi(this._coreApi).then(
                (storeApi) => {
                    this._storeApi = storeApi;
                    this._storeApiPromise = null;

                    return storeApi;
                }
            );
        }

        return this._storeApiPromise;
    }

    /**
     * Gets instance of InboxApi associated with current connection.
     * @returns {Promise<InboxApi>} {@link InboxApi `Promise<InboxApi>`}
     */
    async getInboxApi(): Promise<InboxApi> {
        if (this._inboxApi) {
            return this._inboxApi;
        }

        if (!this._inboxApiPromise) {
            this._inboxApiPromise = Promise.all([this.getThreadApi(), this.getStoreApi()])
                .then(([threadApi, storeApi]) => {
                    return EndpointFactoryProvider.createInboxApi(
                        this._coreApi,
                        threadApi,
                        storeApi
                    );
                })
                .then((inboxApi) => {
                    this._inboxApi = inboxApi;
                    this._inboxApiPromise = null;

                    return inboxApi;
                });
        }

        return this._inboxApiPromise;
    }

    /**
     * Gets instance of `EventQueue`.
     * @returns {Promise<EventQueue>} {@link EventQueue `Promise<EventQueue>`}
     */
    static async getEventQueue(): Promise<EventQueue> {
        if (this._eventQueue) {
            return this._eventQueue;
        }

        this._eventQueue = await EndpointFactoryProvider.getEventQueue();
        return this._eventQueue;
    }

    /**
     * Dispatches an event.
     * @param {EndpointApiEvent} event
     */
    private static async dispatchEvent(event: EndpointApiEvent) {
        Endpoint._connections.forEach((connection) => {
            if (event.connectionId === connection._connectionId) {
                connection.eventDispatcher.dispatchEvent(event);
            }
        });
    }

    /**
     * Starts new event loop if there isn't already one.
     * @param options
     * @param {boolean=} options.debug (optional) if set to true, console will log incoming caught events
     *
     */
    static async startEventLoop(
        options: {
            debug?: boolean;
        } = {
            debug: false
        }
    ) {
        if (Endpoint._isEventLoopRunning) {
            return;
        }

        const eventQueue = await Endpoint.getEventQueue();

        Endpoint._isEventLoopRunning = true;
        const listener = Endpoint.dispatchEvent;

        const eventLoop = async () => {
            try {
                const event = await eventQueue.waitEvent();

                if (options.debug === true) {
                    console.log('DEBUG::CAUGHT EVENT:', event);
                }

                if (
                    event.type == 'libConnected' ||
                    event.type == 'libDisconnected' ||
                    event.type == 'libPlatformDisconnected'
                ) {
                    event.channel = 'connection';
                }

                listener(event);

                if (event.type == 'libDisconnected' || event.type == 'libPlatformDisconnected') {
                    this._connections.forEach((con) => {
                        if (con._connectionId == event.connectionId) {
                            this._connections.delete(con._label);
                        }
                    });
                }

                if (event.type == 'libBreak') {
                    clearTimeout(Endpoint._eventLoopId);
                    Endpoint._isEventLoopRunning = false;
                    return;
                }
                Endpoint._eventLoopId = setTimeout(eventLoop, 0);
            } catch (e) {
                console.error(e);
            }
        };
        Endpoint._eventLoopId = setTimeout(eventLoop, 0);
    }

    /**
     * Stops current event loop, unsubscribes from all channels and removes all event handlers.
     */
    static async stopEventLoop() {
        if (!this._isEventLoopRunning) {
            return;
        }
        clearTimeout(Endpoint._eventLoopId);
        await Endpoint._eventQueue.emitBreakEvent();
        Endpoint._isEventLoopRunning = false;
        Endpoint._eventLoopId = -1;
        this._connections.forEach((con) => con.eventDispatcher.removeAllListeners());
    }

    /**
     * Disconnects user from the Bridge.
     */
    async disconnect() {
        this.eventDispatcher.removeAllListeners();
        await this._coreApi.disconnect();
        Endpoint._connections.delete(this._label);
    }

    /**
     * Returns list of Contexts the users has access to.
     *
     * @param {number} pageIndex - indicates from which page should list start
     * @param {ListOptions} [options] - optional options for listing data (default value pageSize: 100, sort: 'desc')
     * @returns {Promise<PagingList<Context>>} {@link PagingList `PagingList<Context>`}
     */
    async listContexts(pageIndex: number = 0, options?: ListOptions): Promise<PagingList<Context>> {
        const _options = {
            pageSize: 100,
            sort: 'desc' as SortOrder,
            ...options
        };

        const contexts = await this._coreApi.listContexts({
            limit: _options.pageSize,
            skip: pageIndex * _options.pageSize,
            sortOrder: _options.sort,
            lastId: _options.lastId
        });

        return contexts;
    }

    private getOn(eventDispatcher: EventDispatcher) {
        return <T extends EndpointApiEvent['type'] & EventsByChannel<'connection'>>(
            eventType: T,
            callback: (payload: Extract<EndpointApiEvent, { type: T }>) => void
        ) => {
            const removeEventListener = eventDispatcher.addEventListener(
                'connection',
                eventType,
                callback
            );
            const _on = this.getOn(eventDispatcher);

            return { on: _on, removeEventListener };
        };
    }

    /**
     * Registers an event listener for connection-related events.
     *
     * @template T
     * @param {T & EventsByChannel<'connection'>} eventType - type of event to listen for
     * @param {function(Extract<EndpointApiEvent, { type: T }>): void} callback - callback function to execute when the event occurs
     * @returns {Promise<{on: SubscribeForChannel<'connection'>, removeEventListener: function() void}>} object containing the `on` function for chaining and `removeEventListener` to unregister the event listener

     */
    on<T extends EndpointApiEvent['type'] & EventsByChannel<'connection'>>(
        eventType: T,
        callback: (payload: Extract<EndpointApiEvent, { type: T }>) => void
    ): SubscribeForChannel<'connection'> & { removeEventListener: () => void } {
        const removeEventListener = this.eventDispatcher.addEventListener(
            'connection',
            eventType,
            callback
        );
        const _on = this.getOn(this.eventDispatcher);

        return { on: _on, removeEventListener };
    }
}
