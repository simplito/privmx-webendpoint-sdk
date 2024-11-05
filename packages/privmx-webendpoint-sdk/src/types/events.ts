import type {
    Inbox,
    InboxDeletedEventData,
    InboxEntry,
    InboxEntryDeletedEventData
} from './inboxes';
import {
    PrivmxFile,
    Store,
    StoreDeletedEventData,
    StoreFileDeletedEventData,
    StoreStatsChangedEventData
} from './store';
import type {
    Message,
    Thread,
    ThreadDeletedEventData,
    ThreadStatsEventData,
    ThreadDeletedMessageEventData
} from './thread';

export type Channel =
    | 'inbox'
    | `inbox/${string}/entries`
    | 'store'
    | `store/${string}/files`
    | 'thread'
    | `thread/${string}/messages`
    | 'connection';

/**
 * Represents a generic event structure.
 */
export interface GenericEvent {
    /**
     * Type of the event.
     */
    type: string;

    /**
     * The channel through which the event was emitted.
     */
    channel: Channel;

    /**
     * Data associated with the event.
     */
    data: any;

    /**
     * ID of connection to which the event was sent.
     */
    connectionId: string;
}

// --- THREAD EVENTS ---

/**
 * Represents an event for when a Thread is created.
 */
export interface ThreadCreatedEvent extends GenericEvent {
    type: EventTypes['THREAD_CREATED'];

    data: Thread;
}

/**
 * Represents an event for when a Thread is updated.
 */
export interface ThreadUpdatedEvent extends GenericEvent {
    type: EventTypes['THREAD_UPDATED'];

    data: Thread;
}

/**
 * Represents an event for when a Thread is deleted.
 */
export interface ThreadDeletedEvent extends GenericEvent {
    type: EventTypes['THREAD_DELETED'];

    data: ThreadDeletedEventData;
}

/**
 * Represents an event for when a new message is added to a Thread.
 */
export interface ThreadNewMessageEvent extends GenericEvent {
    type: EventTypes['THREAD_NEW_MESSAGE'];

    data: Message;
}

/**
 * Represents an event for when a message is deleted from a Thread.
 */
export interface ThreadMessageDeletedEvent extends GenericEvent {
    type: EventTypes['THREAD_MESSAGE_DELETED'];

    data: ThreadDeletedMessageEventData;
}

export type ThreadEvents = ThreadCreatedEvent | ThreadDeletedEvent | ThreadStatsEvent | ThreadUpdatedEvent

/**
 * Represents an event for when Thread statistics are updated. For example a new message has arrived (there is no need to subscribe to a specific Thread).
 */
export interface ThreadStatsEvent extends GenericEvent {
    type: EventTypes['THREAD_STATS'];

    data: ThreadStatsEventData;
}

/**
 * Represents an event for when a message in a Thread is updated.
 */
export interface ThreadMessageUpdatedEvent extends GenericEvent {
    type: EventTypes['THREAD_MESSAGE_UPDATED'];

    data: Message;
}

export type ThreadMessageEvents = ThreadMessageUpdatedEvent | ThreadNewMessageEvent | ThreadMessageDeletedEvent

// --- STORE EVENTS ---

/**
 * Represents an event for when a Store is created.
 */
export interface StoreCreatedEvent extends GenericEvent {
    type: EventTypes['STORE_CREATED'];

    data: Store;
}

/**
 * Represents an event for when a Store is updated.
 */
export interface StoreUpdatedEvent extends GenericEvent {
    type: EventTypes['STORE_UPDATED'];

    data: Store;
}

/**
 * Represents an event for when a Store is deleted.
 */
export interface StoreDeletedEvent extends GenericEvent {
    type: EventTypes['STORE_DELETED'];

    data: StoreDeletedEventData;
}

/**
 * Represents an event for when the statistics of a Store are changed.
 */
export interface StoreStatsChangedEvent extends GenericEvent {
    type: EventTypes['STORE_STATS'];

    data: StoreStatsChangedEventData;
}

/**
 * Represents an event for when a file is created in a Store.
 */
export interface StoreFileCreatedEvent extends GenericEvent {
    type: EventTypes['STORE_FILE_CREATED'];

    data: PrivmxFile;
}

/**
 * Represents an event for when a file in a Store is updated.
 */
export interface StoreFileUpdatedEvent extends GenericEvent {
    type: EventTypes['STORE_FILE_UPDATED'];

    data: PrivmxFile;
}

/**
 * Represents an event for when a file is deleted from a Store.
 */
export interface StoreFileDeletedEvent extends GenericEvent {
    type: EventTypes['STORE_FILE_DELETED'];

    data: StoreFileDeletedEventData;
}

export type StoreFileEvents = StoreFileDeletedEvent | StoreFileUpdatedEvent | StoreFileCreatedEvent
export type StoreEvents = StoreDeletedEvent | StoreUpdatedEvent | StoreCreatedEvent | StoreStatsChangedEvent

// --- INBOX EVENTS ---

/**
 * Represents an event for when an Inbox is created.
 */

export interface InboxCreatedEvent extends GenericEvent {
    type: EventTypes['INBOX_CREATED'];
    data: Inbox;
}

/**
 * Represents an event for when an Inbox is updated.
 */
export interface InboxUpdatedEvent extends GenericEvent {
    type: EventTypes['INBOX_UPDATED'];
    data: Inbox;
}

/**
 * Represents an event for when an Inbox is deleted.
 */
export interface InboxDeletedEvent extends GenericEvent {
    type: EventTypes['INBOX_DELETED'];
    data: InboxDeletedEventData;
}

/**
 * Represents an event for when a new Inbox entry is added to an Inbox.
 */
export interface InboxEntryCreatedEvent extends GenericEvent {
    type: EventTypes['INBOX_ENTRY_CREATED'];
    data: InboxEntry;
}

/**
 * Represents an event for when an entry is deleted from an Inbox.
 */

export interface InboxEntryDeletedEvent extends GenericEvent {
    type: EventTypes['INBOX_ENTRY_DELETED'];
    data: InboxEntryDeletedEventData;
}

export type InboxEntryEvents = InboxEntryCreatedEvent | InboxEntryDeletedEvent
export type InboxEvents = InboxCreatedEvent | InboxUpdatedEvent | InboxDeletedEvent

// ---- CONNECTION ----

/**
 * Represents an event for when the user connects to PrivMX Bridge.
 */
export interface ConnectedEvent extends GenericEvent {
    type: EventTypes['CONNECTED'];
}

export interface LibDisconnectedEvent extends GenericEvent {
    type: EventTypes['LIB_DISCONNECTED'];
}

/**
 * Represents an event for when the user disconnects from PrivMX Bridge.
 */
export interface DisconnectedEvent extends GenericEvent {
    type: EventTypes['DISCONNECTED'];
}

export interface BreakEvent extends GenericEvent {
    type: EventTypes['LIB_BREAK'];
}

export type EndpointApiEvent =
// | ThreadCreatedEvent
// | ThreadUpdatedEvent
// | ThreadDeletedEvent
// | ThreadStatsEvent

// | ThreadNewMessageEvent
// | ThreadMessageUpdatedEvent
// | ThreadMessageDeletedEvent
    | ThreadEvents
    | ThreadMessageEvents
    | StoreEvents
    // | StoreCreatedEvent
    // | StoreUpdatedEvent
    // | StoreDeletedEvent
    // | StoreStatsChangedEvent
    | StoreFileEvents
    // | StoreFileCreatedEvent
    // | StoreFileUpdatedEvent
    // | StoreFileDeletedEvent
    // | InboxCreatedEvent
    // | InboxUpdatedEvent
    // | InboxDeletedEvent
    | InboxEvents
    | InboxEntryEvents
    | ConnectedEvent
    | DisconnectedEvent
    | LibDisconnectedEvent
    | BreakEvent;

export const EndpointEventTypes = {
    THREAD_CREATED: 'threadCreated',
    THREAD_UPDATED: 'threadUpdated',
    THREAD_DELETED: 'threadDeleted',
    THREAD_STATS: 'threadStatsChanged',
    THREAD_NEW_MESSAGE: 'threadNewMessage',
    THREAD_MESSAGE_UPDATED: 'threadMessageUpdated',
    THREAD_MESSAGE_DELETED: 'threadMessageDeleted',
    STORE_CREATED: 'storeCreated',
    STORE_UPDATED: 'storeUpdated',
    STORE_DELETED: 'storeDeleted',
    STORE_STATS: 'storeStatsChanged',
    STORE_FILE_CREATED: 'storeFileCreated',
    STORE_FILE_UPDATED: 'storeFileUpdated',
    STORE_FILE_DELETED: 'storeFileDeleted',
    INBOX_DELETED: 'inboxDeleted',
    INBOX_UPDATED: 'inboxUpdated',
    INBOX_CREATED: 'inboxCreated',
    INBOX_ENTRY_CREATED: 'inboxEntryCreated',
    INBOX_ENTRY_DELETED: 'inboxEntryDeleted',
    CONNECTED: 'libConnected',
    DISCONNECTED: 'libDisconnected',
    LIB_DISCONNECTED: 'libPlatformDisconnected',
    LIB_BREAK: 'libBreak'
} as const;

export const channelEventsMap = {
    thread: [
        EndpointEventTypes.THREAD_CREATED,
        EndpointEventTypes.THREAD_DELETED,
        EndpointEventTypes.THREAD_STATS,
        EndpointEventTypes.THREAD_UPDATED
    ],
    inbox: [
        EndpointEventTypes.INBOX_CREATED,
        EndpointEventTypes.INBOX_DELETED,
        EndpointEventTypes.INBOX_UPDATED
    ],
    store: [
        EndpointEventTypes.STORE_CREATED,
        EndpointEventTypes.STORE_DELETED,
        EndpointEventTypes.STORE_STATS,
        EndpointEventTypes.STORE_UPDATED
    ],
    threadMessages: [
        EndpointEventTypes.THREAD_NEW_MESSAGE,
        EndpointEventTypes.THREAD_MESSAGE_UPDATED,
        EndpointEventTypes.THREAD_MESSAGE_DELETED
    ],
    storeFiles: [
        EndpointEventTypes.STORE_FILE_CREATED,
        EndpointEventTypes.STORE_FILE_DELETED,
        EndpointEventTypes.STORE_FILE_UPDATED
    ],
    inboxEntries: [EndpointEventTypes.INBOX_ENTRY_CREATED, EndpointEventTypes.INBOX_ENTRY_DELETED],
    connection: [
        EndpointEventTypes.CONNECTED,
        EndpointEventTypes.LIB_DISCONNECTED,
        EndpointEventTypes.DISCONNECTED
    ]
} satisfies Record<
    Channel | 'threadMessages' | 'storeFiles' | 'inboxEntries',
    Array<EndpointApiEvent['type']>
>;

export type ChannelEventsMap = typeof channelEventsMap;
export type ChannelEvents<C extends keyof ChannelEventsMap> = ChannelEventsMap[C] extends Array<
        infer R
    >
    ? R
    : never;

export type EventTypes = {
    [T in keyof typeof EndpointEventTypes]: (typeof EndpointEventTypes)[T];
};

export type ExtractEvent<T extends EndpointApiEvent['type']> = Extract<
    EndpointApiEvent,
    { type: T }
>;

export type EventsByChannel<C extends keyof ChannelEventsMap> = ChannelEvents<C> &
    EndpointApiEvent['type'];

export interface SubscribeForChannel<T extends keyof ChannelEventsMap> {
    on: <E extends ChannelEvents<T>>(
        eventType: E,
        callback: (
            payload: Extract<
                EndpointApiEvent,
                {
                    type: E;
                }
            >
        ) => void
    ) => SubscribeForChannel<T> & { removeEventListener: () => void };
}
