import { deserializeObject, Endpoint, serializeObject } from '@simplito/privmx-webendpoint-sdk';

async function basic() {
    const users = [{ userId: 'MY_USER', pubKey: 'PUB_KEY' }, { userId: 'MY_USER2', pubKey: 'PUB_KEY2' }];
    const managers = [{ userId: 'MY_USER', pubKey: 'PUB_KEY' }];

    const connection = await Endpoint.connection().inboxes.new({
        contextId: 'CONTEXT_ID',
        managers: managers,
        users: users
    });

}


async function inboxWithName() {
    //[snippet lang="js" name="inbox-with-name"]
    const users = [{ userId: 'MY_USER', pubKey: 'PUB_KEY' }, { userId: 'MY_USER2', pubKey: 'PUB_KEY2' }];
    const managers = [{ userId: 'MY_USER', pubKey: 'PUB_KEY' }];

    const privateMeta = {
        name: 'Contact Form'
    };

    const storeId = await Endpoint.connection().stores.new({
        contextId: 'CONTEXT_ID',
        users,
        managers,
        privateMeta: serializeObject(privateMeta)
    });
    //[end snippet]
}

async function inboxPublicView() {
    const users = [{ userId: 'MY_USER', pubKey: 'PUB_KEY' }, { userId: 'MY_USER2', pubKey: 'PUB_KEY2' }];
    const managers = [{ userId: 'MY_USER', pubKey: 'PUB_KEY' }];

    const privateMeta = {
        name: 'Album'
    };

    const publicMeta = {
        formScheme: [
            { question: 'Your name' },
            { question: 'E-mail' }
        ]
    };

    const storeId = await Endpoint.connection().inboxes.new({
        contextId: 'CONTEXT_ID',
        users,
        managers,
        privateMeta: serializeObject(privateMeta),
        publicMeta: serializeObject(publicMeta)
    });
}

// Fetching inboxes

async function mostRecent() {
    const inboxList = await Endpoint.connection().stores.list({ contextId: 'CONTEXT_ID' });

    const inboxes = inboxList.readItems.map(inbox => {
        return {
            ...inbox,
            privateMeta: deserializeObject(inbox.privateMeta),
            publicMeta: deserializeObject(inbox.publicMeta)
        };
    });
}

async function oldestInboxes() {

    const storeList = await Endpoint.connection().inboxes.list({
        contextId: 'CONTEXT_ID',
        pageIndex: 0,
        options: {
            sort: 'asc'
        }
    });
}

async function byInboxId() {
    const store = await Endpoint.connection().store('STORE_ID').info();

    const privateMeta = deserializeObject(store.privateMeta);
    const publicMeta = deserializeObject(store.publicMeta);
}

async function paging() {
    const pageSize = 20;

    const inboxList = await Endpoint.connection().inboxes.list({
        contextId: 'CONTEXT_ID',
        options: {
            pageSize
        }
    });

    const parsedInboxes = inboxList.readItems.map(inbox => {
        return {
            ...inbox,
            privateMeta: deserializeObject(inbox.privateMeta),
            publicMeta: deserializeObject(inbox.publicMeta)
        };
    });
}

// Modyfing

async function renameInboxes() {
    const inboxInfo = await Endpoint.connection().inbox('INBOX_ID').info();

    const newUsers = inboxInfo.users.map(user => ({
            //Your application must provide a way,
            //to get user's public key from their userId.
            userId: user,
            pubKey: 'USER_PUBLIC_KEY'
        })
    );
    const newManagers = newUsers.filter(user =>
        inboxInfo.managers.find(manager => manager == user.userId));

    const newPrivateMeta = {
        title: 'New Inbox name'
    };

    await Endpoint.connection().inbox('INBOX_ID').update({
        publicMeta: inboxInfo.publicMeta,
        version: inboxInfo.version,
        users: newUsers,
        managers: newManagers,
        privateMeta: serializeObject(newPrivateMeta)
    });
}

async function removingUser() {
    const inbox = Endpoint.connection().inbox('INBOX_ID');
    const inboxInfo = await inbox.info();
    const userToRemove = 'USER_ID_TO_REMOVE';

    //Get all users who were in the Store,
    //besides the one you want to remove:
    const newUsers = inboxInfo.users
        .filter(user => user !== userToRemove)
        .map(user => ({
                //Your application must provide a way,
                //to get user's public key from their userId.
                userId: user,
                pubKey: 'USER_PUBLIC_KEY'
            })
        );

    const newManagers = newUsers.filter(user =>
        inboxInfo.managers.find(manager => manager == user.userId));

    await inbox.update({
        ...inboxInfo,
        users: newUsers,
        managers: newManagers
    });
}

async function removingStore() {

    await Endpoint.connection().inbox('INBOX_ID').delete();
}