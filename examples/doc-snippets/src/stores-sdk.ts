/* eslint-disable @typescript-eslint/no-unused-vars */

import { deserializeObject, Endpoint, serializeObject } from '@simplito/privmx-webendpoint-sdk';

async function basicStore() {
    const users = [
        { userId: 'MY_USER', pubKey: 'PUB_KEY' },
        { userId: 'MY_USER2', pubKey: 'PUB_KEY2' }
    ];
    const managers = [{ userId: 'MY_USER', pubKey: 'PUB_KEY' }];

    const storeId = await Endpoint.connection().stores.new({
        contextId: 'CONTEXT_ID',
        users,
        managers
    });
}

async function withName() {
    const users = [
        { userId: 'MY_USER', pubKey: 'PUB_KEY' },
        { userId: 'MY_USER2', pubKey: 'PUB_KEY2' }
    ];
    const managers = [{ userId: 'MY_USER', pubKey: 'PUB_KEY' }];

    const privateMeta = {
        name: 'Photo Album'
    };

    const storeId = await Endpoint.connection().stores.new({
        contextId: 'CONTEXT_ID',
        users,
        managers,
        privateMeta: serializeObject(privateMeta)
    });
}

async function withPublicMEta() {
    const users = [
        { userId: 'MY_USER', pubKey: 'PUB_KEY' },
        { userId: 'MY_USER2', pubKey: 'PUB_KEY2' }
    ];
    const managers = [{ userId: 'MY_USER', pubKey: 'PUB_KEY' }];

    const privateMeta = {
        name: 'Album'
    };

    const publicMeta = {
        tags: ['TAG1', 'TAG2', 'TAG3']
    };

    const storeId = await Endpoint.connection().stores.new({
        contextId: 'CONTEXT_ID',
        users,
        managers,
        privateMeta: serializeObject(privateMeta),
        publicMeta: serializeObject(publicMeta)
    });
}

async function mostRecent() {
    const context = Endpoint.connection();
    const storesList = await Endpoint.connection().stores.list({
        contextId: 'CONTEXT_ID'
    });

    const parsedStores = storesList.readItems.map((store) => {
        return {
            ...store,
            privateMeta: deserializeObject(store.privateMeta),
            publicMeta: deserializeObject(store.publicMeta)
        };
    });
}

async function oldestStores() {
    const storeList = await Endpoint.connection().stores.list({
        contextId: 'CONTEXT_ID',
        pageIndex: 0,
        options: {
            sort: 'asc'
        }
    });
}

async function byStoreId() {
    const store = await Endpoint.connection().store('STORE_ID').info();
    const privateMeta = deserializeObject(store.privateMeta);
    const publicMeta = deserializeObject(store.publicMeta);
}

async function pagging() {
    const storeList = await Endpoint.connection().stores.list({
        contextId: 'CONTEXT_ID',
        options: {
            pageSize: 20
        }
    });

    const parsedThreads = storeList.readItems.map((thread) => {
        return {
            ...thread,
            privateMeta: deserializeObject(thread.privateMeta),
            publicMeta: deserializeObject(thread.publicMeta)
        };
    });
}

// Modyfing Stores

async function renamingStores() {
    const store = Endpoint.connection().store('STORE_ID');
    const storeInfo = await store.info();

    const newUsers = storeInfo.users.map((user) => ({
        //Your application must provide a way,
        //to get user's public key from their userId.
        userId: user,
        pubKey: 'USER_PUBLIC_KEY'
    }));

    const newManagers = newUsers.filter((user) =>
        storeInfo.managers.find((manager) => manager == user.userId)
    );

    const newPrivateMeta = {
        title: 'New Store name'
    };

    await store.update({
        publicMeta: storeInfo.publicMeta,
        version: storeInfo.version,
        users: newUsers,
        managers: newManagers,
        privateMeta: serializeObject(newPrivateMeta)
    });
}

async function removingUsers() {
    const context = Endpoint.connection();
    const store = context.store('STORE_ID');
    const storeInfo = await store.info();

    const userToRemove = 'USERID_TO_REMOVE';

    //Get all users who were in the Store,
    //besides the one you want to remove:
    const newUsers = storeInfo.users
        .filter((user) => user !== userToRemove)
        .map((user) => ({
            //Your application must provide a way,
            //to get user's public key from their userId.
            userId: user,
            pubKey: 'USER_PUBLIC_KEY'
        }));

    const newManagers = newUsers.filter((user) =>
        storeInfo.managers.find((manager) => manager == user.userId)
    );

    await store.update({
        ...storeInfo,
        users: newUsers,
        managers: newManagers
    });
}

async function deleteStore() {
    await Endpoint.connection().store('STORE_ID').delete();
}
