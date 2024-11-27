/* eslint-disable @typescript-eslint/no-unused-vars */

import { deserializeObject, Endpoint, serializeObject } from '@simplito/privmx-webendpoint-sdk';

async function f() {
    const users = [
        { userId: 'MY_USER', pubKey: 'PUB_KEY' },
        { userId: 'MY_USER2', pubKey: 'PUB_KEY2' }
    ];
    const managers = [{ userId: 'MY_USER', pubKey: 'PUB_KEY' }];

    const threadId = await Endpoint.connection().threads.new({
        contextId: 'CONTEXT_ID',
        users,
        managers
    });
}

async function j() {
    // import { serializeObject, Endpoint } from '@simplito/privmx-endpoint-web-sdk';

    const users = [
        { userId: 'MY_USER', pubKey: 'PUB_KEY' },
        { userId: 'MY_USER2', pubKey: 'PUB_KEY2' }
    ];
    const managers = [{ userId: 'MY_USER', pubKey: 'PUB_KEY' }];

    const privateMeta = {
        name: 'First thread'
    };

    const threadId = await Endpoint.connection().threads.new({
        contextId: 'CONTEXT_ID',
        users,
        managers,
        privateMeta: serializeObject(privateMeta)
    });
}

async function p() {
    const users = [
        { userId: 'MY_USER', pubKey: 'PUB_KEY' },
        { userId: 'MY_USER2', pubKey: 'PUB_KEY2' }
    ];
    const managers = [{ userId: 'MY_USER', pubKey: 'PUB_KEY' }];

    const privateMeta = {
        name: 'First Thread'
    };

    const publicMeta = {
        tags: ['TAG1', 'TAG2', 'TAG3']
    };

    const threadId = await Endpoint.connection().threads.new({
        contextId: 'CONTEXT_ID',
        users,
        managers,
        privateMeta: serializeObject(privateMeta),
        publicMeta: serializeObject(publicMeta)
    });
}

// Getting Started

async function oldestThreads() {
    const threadList = await Endpoint.connection().threads.list({
        contextId: 'CONTEXT_ID',
        pageIndex: 0,
        options: {
            sort: 'asc'
        }
    });
}

async function c() {
    const threadList = await Endpoint.connection().threads.list({
        contextId: 'CONTEXT_ID'
    });

    const parsedThreads = threadList.readItems.map((thread) => {
        return {
            ...thread,
            privateMeta: deserializeObject(thread.privateMeta),
            publicMeta: deserializeObject(thread.publicMeta)
        };
    });
}

async function byThreadID() {
    const thread = await Endpoint.connection().thread('THREAD_ID').info();

    const privateMeta = deserializeObject(thread.privateMeta);
    const publicMeta = deserializeObject(thread.publicMeta);
}

async function pagingList() {
    const pageSize = 20;

    const threadList = await Endpoint.connection().threads.list({
        contextId: 'CONTEXT_ID',
        pageIndex: 1,
        options: {
            pageSize: pageSize
        }
    });

    const parsedThreads = threadList.readItems.map((thread) => {
        return {
            ...thread,
            privateMeta: deserializeObject(thread.privateMeta),
            publicMeta: deserializeObject(thread.publicMeta)
        };
    });
}

// Managing Threads

async function renamingThreads() {
    const thread = Endpoint.connection().thread('THREAD_ID');
    const threadInfo = await thread.info();

    const newUsers = threadInfo.users.map((user) => ({
        //Your application must provide a way,
        //to get user's public key from their userId.
        userId: user,
        pubKey: 'USER_PUBLIC_KEY'
    }));

    const newManagers = newUsers.filter((user) =>
        threadInfo.managers.find((manager) => manager == user.userId)
    );

    const newPrivateMeta = {
        title: 'New thread name'
    };

    await thread.update({
        publicMeta: threadInfo.publicMeta,
        version: threadInfo.version,
        users: newUsers,
        managers: newManagers,
        privateMeta: serializeObject(newPrivateMeta)
    });
}

async function removingUsers() {
    const thread = Endpoint.connection().thread('THREAD_ID');
    const threadInfo = await thread.info();

    const userToRemove = 'USERID_TO_REMOVE';

    //Get all users who were in the Thread,
    //besides the one you want to remove:
    const newUsers = threadInfo.users
        .filter((user) => user !== userToRemove)
        .map((user) => ({
            //Your application must provide a way,
            //to get user's public key from their userId.
            userId: user,
            pubKey: 'USER_PUBLIC_KEY'
        }));

    const newManagers = newUsers.filter((user) =>
        threadInfo.managers.find((manager) => manager == user.userId)
    );

    await thread.update({
        ...threadInfo,
        users: newUsers,
        managers: newManagers
    });
}

async function deletingThread() {
    await Endpoint.connection().thread('THREAD_ID').delete();
}
