import { Context, PagingList, PagingQuery } from '../../types';
import { ConnectionInterface } from './ConnectionInterface';

/**
 * Class representing a connection
 */
export class Connection implements ConnectionInterface {
    public constructor(private api: ConnectionInterface) {}

    async freeApis(): Promise<void> {
        return await this.api.freeApis();
    }

    async getConnectionId(): Promise<string> {
        return await this.api.getConnectionId();
    }

    async listContexts(query: PagingQuery): Promise<PagingList<Context>> {
        return await this.api.listContexts(query);
    }

    async disconnect(): Promise<void> {
        return await this.api.disconnect();
    }
}
