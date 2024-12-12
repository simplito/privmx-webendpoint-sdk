import { Connection } from './api/connection/Connection';
import { CryptoApi } from './api/crypto/CryptoApi';
import { EventQueue } from './api/event-queue/EventQueue';
import { InboxApi } from './api/inbox/InboxApi';
import { StoreApi } from './api/store/StoreApi';
import { ThreadApi } from './api/thread/ThreadApi';

export declare class EndpointFactory {
    static connect: (privKey: string, solutionId: string, bridgeUrl: string) => Promise<Connection>;

    static connectPublic: (solutionId: string, bridgeUrl: string) => Promise<Connection>;

    static createThreadApi: (coreApi: Connection) => Promise<ThreadApi>;

    static createStoreApi: (coreApi: Connection) => Promise<StoreApi>;

    static createInboxApi: (
        coreApi: Connection,
        threadApi: ThreadApi,
        storeApi: StoreApi
    ) => Promise<InboxApi>;

    static getEventQueue: () => Promise<EventQueue>;

    static createCryptoApi: () => Promise<CryptoApi>;

    static api: any;
    static eventQueueNative: any;
    static connectionNative: any;
    static threadApiNative: any;
    static storeApiNative: any;
    static inboxApiNative: any;
    static cryptoApiNative: any;
}

/**
 * Wrapper on the ApiFactory class
 */
export class EndpointFactoryProvider {
    /**
     * Checks whether the library has been fully loaded
     */
    private static async ensureApiFactoryReady(): Promise<void> {
        let attemptId = 0;

        while (!isApiFactoryReady() && attemptId++ < 100) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (!isApiFactoryReady()) {
            setTimeout(() => {
                location.reload();
            }, 5000);
            throw new Error('Service API could not be loaded');
        }
    }

    /**
     * Connects to the PrivMX Bridge
     * @param {string} privKey private key
     * @param {string} solutionId solution ID
     * @param {string} bridgeUrl Bridge URL
     * @returns {Connection} returns a {@link Connection `Connection` instance}
     */
    static async connect(
        privKey: string,
        solutionId: string,
        bridgeUrl: string
    ): Promise<Connection> {
        await this.ensureApiFactoryReady();
        return await EndpointFactory.connect(privKey, solutionId, bridgeUrl);
    }

    /**
     * Connects to the PrivMX Bridge as a guest
     * @param {string} solutionId solution ID
     * @param {string} bridgeUrl Bridge URL
     * @returns {Promise<Connection>} returns a promise that resolves with a {@link Connection `Connection`} instance
     */
    static async connectPublic(solutionId: string, bridgeUrl: string): Promise<Connection> {
        await this.ensureApiFactoryReady();
        return await EndpointFactory.connectPublic(solutionId, bridgeUrl);
    }

    /**
     * Creates a API for managing Threads
     * @param {Connection} connection  connection instance that was returned from connecting
     * @returns {Promise<ThreadApi>} a promise that resolves with a {@link ThreadApi `ThreadApi`} instance
     */
    static async createThreadApi(connection: Connection): Promise<ThreadApi> {
        await this.ensureApiFactoryReady();
        return await EndpointFactory.createThreadApi(connection);
    }

    /**
     * Creates a API for managing Stores
     * @param {Connection} connection  connection instance that was returned from connecting
     * @returns {Promise<StoreApi>} a promise that resolves with a {@link StoreApi `StoreApi`} instance
     */
    static async createStoreApi(connection: Connection): Promise<StoreApi> {
        await this.ensureApiFactoryReady();
        return await EndpointFactory.createStoreApi(connection);
    }

    /**
     * Creates a API for cryptography
     * @returns {Promise<CryptoApi>} a promise that resolves with {@link CryptoApi `CryptoApi`} instance
     */
    static async createCryptoApi(): Promise<CryptoApi> {
        await this.ensureApiFactoryReady();
        return await EndpointFactory.createCryptoApi();
    }

    /**
     * Creates a API for managing Inboxes
     * @param {Connection} connection  connection instance that was returned from connecting
     * @param {ThreadApi} threadApi  a {@link ThreadApi `ThreadApi` instance}
     * @param {StoreApi} storeApi a {@link StoreApi `StoreApi` instance}
     * @returns {Promise<InboxApi>} a promise that resolves with an {@link InboxApi `InboxApi`} instance
     */
    static async createInboxApi(
        connection: Connection,
        threadApi: ThreadApi,
        storeApi: StoreApi
    ): Promise<InboxApi> {
        await this.ensureApiFactoryReady();
        return await EndpointFactory.createInboxApi(connection, threadApi, storeApi);
    }

    /**
     * Creates a event queue that is used for handling events
     * @returns {Promise<EventQueue>} a promise that resolves with a {@link EventQueue `EventQueue`} instance
     */
    static async getEventQueue(): Promise<EventQueue> {
        await this.ensureApiFactoryReady();
        return await EndpointFactory.getEventQueue();
    }
}

function isApiFactoryReady() {
    return typeof EndpointFactory !== 'undefined' && typeof EndpointFactory.api !== 'undefined';
}
