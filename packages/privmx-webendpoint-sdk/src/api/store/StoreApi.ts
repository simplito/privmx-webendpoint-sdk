import { PrivmxFile, PagingList, PagingQuery, Store, UserWithPubKey } from '../../types';
import { ContainerPolicy } from '../../types/core';
import { StoreApiInterface } from './StoreApiInterface';

export class StoreApi implements StoreApiInterface {
    public constructor(private api: StoreApiInterface) {}

    async updateFileMeta(
        fileId: string,
        publicMeta: Uint8Array,
        privateMeta: Uint8Array
    ): Promise<void> {
        return await this.api.updateFileMeta(fileId, publicMeta, privateMeta);
    }

    async listStores(contextId: string, query: PagingQuery): Promise<PagingList<Store>> {
        return await this.api.listStores(contextId, query);
    }

    async getStore(storeId: string): Promise<Store> {
        return await this.api.getStore(storeId);
    }

    async createStore(
        contextId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        policies?: ContainerPolicy
    ): Promise<string> {
        return await this.api.createStore(
            contextId,
            users,
            managers,
            publicMeta,
            privateMeta,
            policies
        );
    }

    async updateStore(
        storeId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        version: number,
        force: boolean,
        forceGenerateNewKey: boolean,
        policies?: ContainerPolicy
    ): Promise<void> {
        return await this.api.updateStore(
            storeId,
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

    async deleteStore(storeId: string): Promise<void> {
        return await this.api.deleteStore(storeId);
    }

    async getFile(fileId: string): Promise<PrivmxFile> {
        return await this.api.getFile(fileId);
    }

    async listFiles(storeId: string, query: PagingQuery): Promise<PagingList<PrivmxFile>> {
        return await this.api.listFiles(storeId, query);
    }

    async createFile(
        storeId: string,
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        size: number
    ): Promise<number> {
        return await this.api.createFile(storeId, publicMeta, privateMeta, size);
    }

    async updateFile(
        fileId: string,
        publicMeta: Uint8Array,
        privateMeta: Uint8Array,
        size: number
    ): Promise<number> {
        return await this.api.updateFile(fileId, publicMeta, privateMeta, size);
    }

    async openFile(fileId: string): Promise<number> {
        return await this.api.openFile(fileId);
    }

    async readFromFile(handle: number, chunk: number): Promise<Uint8Array> {
        return await this.api.readFromFile(handle, chunk);
    }

    async writeToFile(handle: number, data: Uint8Array): Promise<void> {
        return await this.api.writeToFile(handle, data);
    }

    async seekInFile(handle: number, pos: number): Promise<void> {
        return await this.api.seekInFile(handle, pos);
    }

    async closeFile(handle: number): Promise<string> {
        return await this.api.closeFile(handle);
    }

    async deleteFile(fileId: string): Promise<void> {
        return await this.api.deleteFile(fileId);
    }

    async subscribeForStoreEvents(): Promise<void> {
        return await this.api.subscribeForStoreEvents();
    }

    async unsubscribeFromStoreEvents(): Promise<void> {
        return await this.api.unsubscribeFromStoreEvents();
    }

    async subscribeForFileEvents(storeId: string): Promise<void> {
        return await this.api.subscribeForFileEvents(storeId);
    }

    async unsubscribeFromFileEvents(storeId: string): Promise<void> {
        return await this.api.unsubscribeFromFileEvents(storeId);
    }
}
