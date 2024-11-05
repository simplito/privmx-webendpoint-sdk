import { Endpoint } from '@simplito/privmx-webendpoint-sdk';

async function startEventLoop() {
    await Endpoint.startEventLoop();
}


async function stopEventLoop() {
    const channel = await Endpoint.connection().threads.subscribeToThreadEvents();

    const eventHandle = channel.on('threadCreated', data => {
        console.log(data);
    });

    eventHandle.removeEventListener();

    await Endpoint.connection().threads.unsubscribeFromThreadEvents();
}


async function connectionEvents() {
    // For connection type events you do not have to subscribe separately.
    const eventHandle = Endpoint.connection().on('libConnected', data => {
        console.log('connected');
    });

    eventHandle.removeEventListener();
}


async function threadEvenrs() {
    const channel = await Endpoint.connection().threads.subscribeToThreadEvents();

    channel.on('threadCreated', (data) => console.log(data))
        .on('threadDeleted', (data => console.log(data)))
        .on('threadStatsChanged', (data) => console.log(data));

    // Unsubscribing from channel
    await Endpoint.connection().threads.unsubscribeFromThreadEvents();
}

/** Subscribing to:
 * - threadNewMessage
 * - threadMessageDeleted
 * - threadMessageUpdated
 */
async function messagesEvents() {
    const channel = await Endpoint.connection().thread('THREAD_ID').subscribeToMessageEvents();

    // Adding listeners
    channel.on('threadNewMessage', (data) => console.log(data))
        .on('threadMessageDeleted', (data) => console.log(data));

    // Unsubscribing from message events
    await Endpoint.connection().thread('THREAD_ID').unsubscribeFromMessageEvents();
}

/** Subscribing to:
 * - storeCreated
 * - storeDeleted
 * - storeStats
 * - storeUpdated
 */
async function storeEvents() {


    const channel = await Endpoint.connection().stores.subscribeToStores();

    // Adding listeners
    channel.on('storeCreated', (data) => console.log(data))
        .on('storeDeleted', (data) => console.log(data))
        .on('storeStatsChanged', (data) => console.log(data));

// Unsubscribing from channel
    await Endpoint.connection().stores.unsubscribeFromStoreEvents();
}

/** Subscribing to:
 * - storeFileCreated
 * - storeFileDeleted
 * - storeFileUpdated
 */
async function fileEvents() {
    const channel = await Endpoint.connection().store('STORE_ID').subscribeForFileEvents();

    // Adding listeners
    channel.on('storeFileCreated', (data) => console.log(data))
        .on('storeFileDeleted', (data) => console.log(data));

    // Unsubscribing from file events
    await Endpoint.connection().store('STORE_ID').unsubscribeFromFileEvents();
}

/** Subscribing to:
 * - inboxCreated
 * - inboxDeleted
 * - inboxUpdated
 */
async function inboxesEvents() {
    const channel = await Endpoint.connection().inboxes.subscribeForInboxEvents();

    // Adding listeners
    channel.on('inboxCreated', (data) => console.log(data))
        .on('inboxDeleted', (data) => console.log(data));

    // Unsubscribing from channel
    await Endpoint.connection().inboxes.unsubscribeFromInboxEvents();
}

async function inboxEntriesEvents() {
    /** Subscribing to:
     * - inboxEntryCreated
     * - inboxEntryDeleted
     */
    const channel = await Endpoint.connection().inbox('INBOX_ID').subscribeForEntryEvents();

    // Adding listeners
    channel.on('inboxEntryCreated', (data) => console.log(data))
        .on('inboxEntryDeleted', (data) => console.log(data));

// Unsubscribing from inbox entry events
    await Endpoint.connection().inbox('INBOX_ID').unsubscribeFromEntryEvents();
}