import {
    UserWithPubKey,
    InboxPublicView,
    FilesConfig,
    Inbox,
    InboxEntry,
    PagingList,
    PagingQuery
} from '../../types';
import { InboxApiInterface } from './InboxApiInterface';

/**
 * Inbox API from the PrivMX Endpoint Web
 */
export class InboxApi implements InboxApiInterface {
    public constructor(private api: InboxApiInterface) {}
    async createInbox(
        contextId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        filesConfig: FilesConfig | undefined
    ): Promise<string> {
        return await this.api.createInbox(
            contextId,
            users,
            managers,
            publicMeta,
            privateMeta,
            filesConfig
        );
    }
    async updateInbox(
        inboxId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        filesConfig: FilesConfig | undefined,
        version: number,
        force: boolean,
        forceGenerateNewKey: boolean
    ): Promise<void> {
        return await this.api.updateInbox(
            inboxId,
            users,
            managers,
            publicMeta,
            privateMeta,
            filesConfig,
            version,
            force,
            forceGenerateNewKey
        );
    }
    async getInbox(inboxId: string): Promise<Inbox> {
        return await this.api.getInbox(inboxId);
    }
    async listInboxes(contextId: string, query: PagingQuery): Promise<PagingList<Inbox>> {
        return await this.api.listInboxes(contextId, query);
    }
    async getInboxPublicView(inboxId: string): Promise<InboxPublicView> {
        return await this.api.getInboxPublicView(inboxId);
    }
    async deleteInbox(inboxId: string): Promise<void> {
        return await this.api.deleteInbox(inboxId);
    }
    async readEntry(inboxEntryId: string): Promise<InboxEntry> {
        return await this.api.readEntry(inboxEntryId);
    }
    async listEntries(inboxId: string, query: PagingQuery): Promise<PagingList<InboxEntry>> {
        return await this.api.listEntries(inboxId, query);
    }

    async deleteEntry(inboxEntryId: string): Promise<void> {
        return await this.api.deleteEntry(inboxEntryId);
    }

    async openFile(fileId: string): Promise<number> {
        return await this.api.openFile(fileId);
    }
    async readFromFile(fileHandle: number, length: number): Promise<Uint8Array> {
        return await this.api.readFromFile(fileHandle, length);
    }
    async seekInFile(fileHandle: number, position: number): Promise<void> {
        return await this.api.seekInFile(fileHandle, position);
    }
    async closeFile(fileHandle: number): Promise<string> {
        return await this.api.closeFile(fileHandle);
    }
    async subscribeForInboxEvents(): Promise<void> {
        return await this.api.subscribeForInboxEvents();
    }
    async unsubscribeFromInboxEvents(): Promise<void> {
        return await this.api.unsubscribeFromInboxEvents();
    }
    async subscribeForEntryEvents(inboxId: string): Promise<void> {
        return await this.api.subscribeForEntryEvents(inboxId);
    }
    async unsubscribeFromEntryEvents(inboxId: string): Promise<void> {
        return await this.api.unsubscribeFromEntryEvents(inboxId);
    }

    async createFileHandle(
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        filesize: number
    ): Promise<number> {
        return await this.api.createFileHandle(publicMeta, privateMeta, filesize);
    }
    async prepareEntry(
        inboxId: string,
        data: Uint8Array,
        inboxFileHandles?: Array<number>,
        userPrivKey?: string
    ): Promise<number> {
        return await this.api.prepareEntry(inboxId, data, inboxFileHandles, userPrivKey);
    }
    async writeToFile(
        inboxHandle: number,
        inboxFileHandle: number,
        dataChunk: Uint8Array
    ): Promise<void> {
        return await this.api.writeToFile(inboxHandle, inboxFileHandle, dataChunk);
    }
    async sendEntry(inboxHandle: number): Promise<void> {
        return await this.api.sendEntry(inboxHandle);
    }
}
