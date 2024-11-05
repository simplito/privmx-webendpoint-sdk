/**
 * Defines the sort order for sorting operations.
 *
 * Can be either:
 * - `'asc'` for ascending order, or
 * - `'desc'` for descending order.
 */
export type SortOrder = 'asc' | 'desc';

export interface ListOptions {
    /**
     How many messages per page (default: 100).
     */
    pageSize?: number;

    /**
     * Sort oder by date.
     * Can be either 'asc' for ascending order or 'desc' for descending.
     */
    sort?: SortOrder;

    /**
     * An optional ID that, if provided, sets the starting point for the query.
     * The item with this ID will be the first item in the result set.
     */
    lastId?: string;
}

/**
 * Represents the query parameters for fetching a paginated list of items.
 */
export interface PagingQuery {
    /**
     * The number of items to skip before starting to collect the result set.
     */
    skip: number;

    /**
     * The maximum number of items to retrieve.
     * It limits the size of the result set.
     */
    limit: number;

    /**
     * Sort order by date.
     * Can be either 'asc' for ascending order or 'desc' for descending.
     */
    sortOrder: SortOrder;

    /**
     * An optional ID that, if provided, sets the starting point for the query.
     * The item with this ID will be the first item in the result set.
     */
    lastId?: string;
}

/**
 * Represents a paginated list of items of type `T`.
 *
 * @template T - type of items in the list
 */
export interface PagingList<T> {
    /**
     * The total number of items available in the entire collection,
     * not just the number of items returned in `readItems`.
     */
    totalAvailable: number;

    /**
     * An array of items of type `T` that were read from the data source.
     */
    readItems: T[];
}

/**
 * Represents a user's Context.
 */
export interface Context {
    /**
     * Unique identifier of the user associated with this Context.
     */
    userId: string;

    /**
     * Unique identifier of given Context.
     */
    contextId: string;
}

/**
 * Represents a user along with their associated public key for cryptographic operations.
 */
export interface UserWithPubKey {
    /**
     * Unique identifier of the user.
     */
    userId: string;

    /**
     * User's public key, used for cryptographic purposes such as
     * verifying the user's identity or securing communications.
     */
    pubKey: string;
}
