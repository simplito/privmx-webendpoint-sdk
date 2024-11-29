import { UserWithPubKey, Message, PagingList, PagingQuery, Thread } from '../../types';
import { ContainerPolicy } from '../../types/policy';
import { ThreadApiInterface } from './ThreadApiInterface';

export class ThreadApi implements ThreadApiInterface {
    public constructor(private api: ThreadApiInterface) {}

    async updateThread(
        threadId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        version: number,
        force: boolean,
        forceGenerateNewKey: boolean,
        policies?: ContainerPolicy
    ): Promise<void> {
        return await this.api.updateThread(
            threadId,
            users,
            managers,
            publicMeta,
            privateMeta,
            version,
            force,
            forceGenerateNewKey,
            policies
        );
    }
    async listThreads(contextId: string, query: PagingQuery): Promise<PagingList<Thread>> {
        return await this.api.listThreads(contextId, query);
    }
    async sendMessage(
        threadId: string,
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        data: Uint8Array
    ): Promise<string> {
        return await this.api.sendMessage(threadId, publicMeta, privateMeta, data);
    }
    async deleteMessage(messageId: string): Promise<void> {
        return await this.api.deleteMessage(messageId);
    }
    async listMessages(threadId: string, query: PagingQuery): Promise<PagingList<Message>> {
        return await this.api.listMessages(threadId, query);
    }
    async getMessage(messageId: string): Promise<Message> {
        return await this.api.getMessage(messageId);
    }
    async updateMessage(
        messageId: string,
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        data: Uint8Array
    ): Promise<void> {
        return await this.api.updateMessage(messageId, publicMeta, privateMeta, data);
    }
    async subscribeForThreadEvents(): Promise<void> {
        return await this.api.subscribeForThreadEvents();
    }
    async unsubscribeFromThreadEvents(): Promise<void> {
        return await this.api.unsubscribeFromThreadEvents();
    }
    async subscribeForMessageEvents(threadId: string): Promise<void> {
        return await this.api.subscribeForMessageEvents(threadId);
    }

    async unsubscribeFromMessageEvents(threadId: string): Promise<void> {
        return await this.api.unsubscribeFromMessageEvents(threadId);
    }
    async createThread(
        contextId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        policies?: ContainerPolicy
    ): Promise<string> {
        return await this.api.createThread(
            contextId,
            users,
            managers,
            publicMeta,
            privateMeta,
            policies
        );
    }

    async deleteThread(threadId: string): Promise<void> {
        return await this.api.deleteThread(threadId);
    }

    async getThread(threadId: string): Promise<Thread> {
        return await this.api.getThread(threadId);
    }
}
