import { Context, PagingList, PagingQuery } from '../../types';

export interface ConnectionInterface {
    /**
     *
     * @param {PagingQuery} query - {@link PagingQuery `PagingQuery` object}
     * @returns {Promise<PagingList<Context>>}
     */
    listContexts(query: PagingQuery): Promise<PagingList<Context>>;

    /**
     * Disconnects from the Bridge.
     * @returns {Promise<void>}
     */
    disconnect: () => Promise<void>;

    /**
     * Gets ID of given connection
     * @returns {Promise<string>}
     */
    getConnectionId: () => Promise<string>;

    /**
     * Deletes all instances of APIs with current connection
     * @returns {Promise<void>}
     */
    freeApis: () => Promise<void>;
}
