import { UserWithPubKey } from './core';

export interface CreateContainerPayload {
    contextId: string;
    users: UserWithPubKey[];
    managers: UserWithPubKey[];
    publicMeta?: Uint8Array;
    privateMeta?: Uint8Array;
}

export interface UpdateContainerPayload {
    users: UserWithPubKey[];
    managers: UserWithPubKey[];
    publicMeta?: Uint8Array;
    privateMeta?: Uint8Array;
    version: number;
    options?: {
        force?: boolean;
        forceGenerateNewKey?: boolean;
    };
}
