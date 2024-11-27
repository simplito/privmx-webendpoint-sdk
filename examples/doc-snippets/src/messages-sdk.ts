/* eslint-disable @typescript-eslint/no-unused-vars */

import { deserializeObject, Endpoint, serializeObject } from '@simplito/privmx-webendpoint-sdk';

async function serialization() {
    const data = {
        content: 'MESSAGE_CONTENT',
        type: 'text'
    };

    const binaryData = serializeObject(data); // returns data encoded to Uint8Array
    const decodedData = deserializeObject(binaryData); // returns JavaScript object
}

// Sending Messages

async function plainText() {
    const thread = Endpoint.connection().thread('THREAD_ID');
    const message = 'Message text';

    const encoder = new TextEncoder();
    const messageId = await thread.sendMessage({
        data: encoder.encode(message)
    });

    const messageList = await thread.getMessages();

    const decoder = new TextDecoder();
    const parsedMessages = messageList.readItems.map((message) => {
        return {
            ...message,
            data: decoder.decode(message.data)
        };
    });
}

async function richText() {
    const thread = Endpoint.connection().thread('THREAD_ID');

    const message = {
        //output from the chosen WYSIWYG editor
    };

    const meta = {
        type: 'markdown'
    };

    await thread.sendMessage({
        data: serializeObject(message),
        publicMeta: serializeObject(meta)
    });

    const decoder = new TextDecoder();

    const messageList = await thread.getMessages();
    const parsedMessages = messageList.readItems.map((message) => {
        const publicMeta = deserializeObject(message.publicMeta);

        if (publicMeta.type === 'markdown') {
            return {
                ...message,
                type: 'markdown',
                data: deserializeObject(message.data)
            };
        } else {
            return {
                ...message,
                type: 'plain_text',
                data: decoder.decode(message.data)
            };
        }
    });
}

async function responding() {
    const thread = Endpoint.connection().thread('THREAD_ID');

    // responseTo is the ID of the message you want to respond to
    const publicMeta = { responseTo: 'MESSAGE_ID_TO_RESPOND' };

    const message = {
        content: 'Response to message',
        type: 'text'
    };

    const msgId = await thread.sendMessage({
        data: serializeObject(message),
        publicMeta: serializeObject(publicMeta)
    });

    const messageList = await thread.getMessages();
    const parsedMessages = messageList.readItems.map((message) => {
        const responseTo = deserializeObject(message.publicMeta).responseTo;

        return {
            ...message,
            data: deserializeObject(message.data),
            responseToId: responseTo || null
        };
    });
}
