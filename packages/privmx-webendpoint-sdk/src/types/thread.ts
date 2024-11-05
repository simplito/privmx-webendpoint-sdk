/**
 * Represents information about the location of given message on the server.
 */
export interface ServerMessageInfo {
    /**
     * Unique ID of the Thread that the message belongs to.
     */
    threadId: string;

    /**
     * Unique ID of the message.
     */
    messageId: string;

    /**
     * Timestamp when the message was created.
     */
    createDate: number;

    /**
     * ID of the author who created the message.
     */
    author: string;
}

/**
 * Represents a message, including its metadata and content.
 */
export interface Message {
    /**
     * Information about the message as stored on the server.
     */
    info: ServerMessageInfo;

    /**
     * Public metadata associated with the message, stored as a byte array.
     */
    publicMeta: Uint8Array;

    /**
     * Private metadata associated with the message, stored as a byte array.
     */
    privateMeta: Uint8Array;

    /**
     * The content of the message itself, stored as a byte array.
     */
    data: Uint8Array;

    /**
     * Public key of the author, used to verify the message's authenticity.
     */
    authorPubKey: string;

    /**
     * Status code of the message, indicating its current state.
     */
    statusCode: number;
}

/**
 * Represents a communication Thread, which may contain multiple messages.
 */
export interface Thread {
    /**
     * Unique ID of the Context to which the Thread belongs.
     */
    contextId: string;

    /**
     * Unique ID of the Thread.
     */
    threadId: string;

    /**
     * Timestamp when the Thread was created.
     */
    createDate: number;

    /**
     * User ID of user who created the Thread
     */
    creator: string;

    /**
     * Timestamp when the Thread was last modified.
     */
    lastModificationDate: number;

    /**
     * The ID of the user who last modified the Thread.
     */ lastModifier: string;

    /**
     * An array of user. IDs who are participants in the Thread.
     */
    users: string[];

    /**
     * An array of user. IDs who are managers of the Thread.
     */
    managers: string[];

    /**
     * The current version of the Thread, used for concurrency control.
     */
    version: number;

    /**
     * Timestamp of the last message sent in the Thread.
     */
    lastMsgDate: number;

    /**
     * Private metadata associated with the Thread, stored as a byte array.
     */
    privateMeta: Uint8Array;

    /**
     * Public metadata associated with the Thread, stored as a byte array.
     */
    publicMeta: Uint8Array;

    /**
     * The total number of. messages in the Thread.
     */
    messagesCount: number;

    /**
     * Status code of retrieval and decryption of the Thread
     */
    statusCode: number;
}

/**
 * Represents the data for an event where a Thread is deleted.
 */
export interface ThreadDeletedEventData {
    /**
     * Unique ID of the deleted Thread.
     */
    threadId: string;
}

/**
 * Represents the data for an event where a message within a Thread is deleted.
 */
export interface ThreadDeletedMessageEventData {
    /**
     * Unique ID of the Thread containing the deleted message.
     */
    threadId: string;

    /**
     * Unique ID of the deleted message within the Thread.
     */
    messageId: string;
}

/**
 * Represents the data for an event providing statistics about a Thread.
 */
export interface ThreadStatsEventData {
    /**
     * Unique ID of the Thread for which statistics are being provided.
     */
    threadId: string;

    /**
     * Timestamp of the last message in the Thread.
     */
    lastMsgDate: number;

    /**
     * The total number of messages in the Thread.
     */
    messagesCount: number;
}

/**
 * Represents payload that is sent while sending a message to a Thread.
 */
export interface ThreadMessagePayload {
    /**
     *Optional, contains confidential data that will be encrypted before being sent to server.
     */
    privateMeta?: Uint8Array;

    /**
     *Optional, contains data that can be accessed by everyone and is not encrypted.
     */
    publicMeta?: Uint8Array;

    /**
     * Content of the message itself.
     */
    data: Uint8Array;
}
