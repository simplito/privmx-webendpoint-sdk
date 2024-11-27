/* eslint-disable @typescript-eslint/no-unused-vars */

import { Endpoint, serializeObject } from '@simplito/privmx-webendpoint-sdk';

async function creatingThreasd() {
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

async function listThreads() {
    const PAGE_SIZE = 30;
    const pageIndex = 0;

    const sortOrder = 'desc';

    const threadList = Endpoint.connection().threads.list({
        contextId: 'CONTEXT_ID',
        pageIndex,
        options: {
            pageSize: PAGE_SIZE,
            sort: sortOrder
        }
    });
}

async function UpdateThread() {
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
        users: newUsers,
        managers: newManagers,
        privateMeta: serializeObject(newPrivateMeta),
        version: threadInfo.version
    });
}

async function sendingMessages() {
    const msgId = await Endpoint.connection()
        .thread('THREAD_ID')
        .sendMessage({
            data: new TextEncoder().encode('My message'),
            privateMeta: new TextEncoder().encode('My private data'),
            publicMeta: serializeObject({
                type: 'type_of_message'
            })
        });
}

async function handlingMessages() {
    // Starting the Event Loop
    await Endpoint.startEventLoop();

    // Handling Thread events
    const threadChannel = await Endpoint.connection().threads.subscribeToThreadEvents();
    threadChannel.on('threadCreated', (payload) => console.log(payload));

    //Handling message Events
    const messageChannel = await Endpoint.connection()
        .thread('THREAD_ID')
        .subscribeToMessageEvents();
    messageChannel.on('threadNewMessage', (payload) => console.log(payload));
}
