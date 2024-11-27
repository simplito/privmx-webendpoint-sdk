import { Message, PagingList, PagingQuery, Thread, UserWithPubKey } from '../../types';

export interface ThreadApiInterface {
    /**
     * Creates a new Thread in a given Context.
     *
     * @param {string} contextId - ID of the Context to create the Thread in
     * @param {UserWithPubKey[]} users - list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access to the created Thread
     * @param {UserWithPubKey[]} managers - list of {@link UserWithPubKey `UserWithPubKey`} objects  which indicates who will have access (and management rights) to the created Thread
     * @param {Uint8Array} publicMeta public (unencrypted) metadata
     * @param {Uint8Array} privateMeta (encrypted) metadata
     * @returns {Promise<string>} String created Thread ID.
     *
     */
    createThread: (
        contextId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        publicMeta: Uint8Array,
        privateMeta: Uint8Array
    ) => Promise<string>;

    /**
     *Updates an existing Thread.
     * @param {string} threadId - ID of the Thread to update
     * @param {UserWithPubKey[]} users - list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access to the updated Thread
     * @param {UserWithPubKey[]} managers - list of {@link UserWithPubKey `UserWithPubKey`} objects which indicates who will have access (and management rights) to the updated Thread
     * @param {Uint8Array} publicMeta public (unencrypted) metadata
     * @param {Uint8Array} privateMeta (encrypted) metadata
     * @param {number} version - current version of the updated Thread
     * @param {boolean} force - force update (without checking version)
     * @param {boolean} forceGenerateNewKey - force to re-generate a key for the Thread
     * @returns {Promise<void>} a promise that resolves with void
     */
    updateThread: (
        threadId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        version: number,
        force: boolean,
        forceGenerateNewKey: boolean
    ) => Promise<void>;

    /**
     * Deletes a Thread by a given Thread ID.
     * @param {string} threadId - ID of the Thread to delete
     * @returns {Promise<void>} a promise that resolves with void
     */
    deleteThread: (threadId: string) => Promise<void>;

    /**
     * Gets a Thread by a given Thread ID.
     * @param {string} threadId - ID of the Thread to get
     * @returns {Promise<Thread>}  {@link Thread `Promise<Thread>`} object containing info about the Thread.
     */
    getThread: (threadId: string) => Promise<Thread>;

    /**
     * Gets a list of Threads in a given Context.
     * @param {string} contextId - ID of the Context to get the Threads from
     * @param {PagingQuery} {@link PagingQuery `PagingQuery`} object
     * @returns {Promise<PagingList<Thread>>} {@link PagingList `PagingList<Thread>`} object containing a list of Threads.
     */
    listThreads: (contextId: string, query: PagingQuery) => Promise<PagingList<Thread>>;

    /**
     * Sends a message to a Thread.
     * @param {string} threadId - ID of the Thread to send the message to
     * @param {Uint8Array} publicMeta - public metadata of the message
     * @param {Uint8Array} privateMeta - private metadata of the message
     * @param {Uint8Array} data - the content of the message
     * @returns {Promise<string>} String created message ID.
     */
    sendMessage: (
        threadId: string,
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        data: Uint8Array
    ) => Promise<string>;

    /**
     * Deletes a message by a given messageId.
     * @param {string} messageId ID of the message to delete
     * @returns {Promise<void>} a promises that resolves with void
     */
    deleteMessage: (messageId: string) => Promise<void>;

    /**
     * Gets a list of messages from a Thread.
     * @param {string} threadId  - ID of the Thread to read messages from
     * @param {PagingQuery} {@link PagingQuery `PagingQuery`} object
     * @returns {Promise<PagingList<Message>>} {@link PagingList `Promise<PagingList<Message>>` } object containing a list of messages.
     *
     * @example
     * ### Getting last 100 messages in Thread.
     * ```ts
     *  const messageList = await threadApi.listMessages(threadId, {skip: 0, limit: 100, sortOrder: "desc"})
     *
     *  // returns last 100 messages with most recent one at the end
     *  const messages = messageList.readIsendMessagetems
     *
     * ```
     */
    listMessages: (threadId: string, query: PagingQuery) => Promise<PagingList<Message>>;

    /**
     * Gets a message by a given messageId.
     * @param {string} messageId - ID of the message to get
     * @returns {Promise<Message>} {@link Message} Object containing the message
     */
    getMessage: (messageId: string) => Promise<Message>;

    /**
     * Updates message in Thread
     * @param {string} messageId - ID of the message to update
     * @param {Uint8Array} publicMeta - public metadata of the message
     * @param {Uint8Array} privateMeta - private metadata of the message
     * @param {Uint8Array} data - the message
     * @returns {Promise<void>} - a promise that resolves with void
     */
    updateMessage: (
        messageId: string,
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        data: Uint8Array
    ) => Promise<void>;

    /**
     * Subscribes to events related to Threads:
     *  - `threadCreated`
     *  - `threadDeleted`
     *  - `threadStatsChanged`
     *  - `threadUpdated`
     * @returns {Promise<void>}
     */
    subscribeForThreadEvents: () => Promise<void>;

    /**
     * Unsubscribes from events related to Threads
     * @returns {Promise<void>} - a promise that resolves with void
     */
    unsubscribeFromThreadEvents: () => Promise<void>;

    /**
     * Subscribes to message events on given Thread:
     * - `threadNewMessage`
     * - `threadMessageDeleted`
     * - `threadMessageUpdated`
     * @param {string} threadId
     * @returns {Promise<void>} - a promise that resolves with void
     */
    subscribeForMessageEvents: (threadId: string) => Promise<void>;

    /**
     * Unsubscribes from messages events on given Thread
     * @param {string} threadId
     * @returns {Promise<void>} - a promise that resolves with void
     */
    unsubscribeFromMessageEvents: (threadId: string) => Promise<void>;
}
