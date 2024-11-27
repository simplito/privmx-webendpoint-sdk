/* eslint-disable @typescript-eslint/no-unused-vars */

import { deserializeObject, Endpoint, serializeObject } from '@simplito/privmx-webendpoint-sdk';

async function entrtiesPublic() {
    const publicConnection = await Endpoint.connectPublic({
        bridgeUrl: 'BRIDGE_URL',
        solutionId: 'SOLUTION_ID'
    });

    await publicConnection.sendDataToInbox('INBOX_ID', {
        data: serializeObject({
            inquiryType: 'newsletter',
            answer: 'email@domain.com'
        })
    });
}

async function entriesprivate() {
    await Endpoint.connection()
        .inbox('INBOX_ID')
        .sendData({
            data: serializeObject({
                inquiryType: 'newsletter',
                answer: 'email@domain.com'
            })
        });
}

//submittin

async function basicSubmit() {
    const entryMessage = 'Example message';
    const sentEntry = await Endpoint.connection()
        .inbox('INBOX_ID')
        .sendData({
            data: new TextEncoder().encode(entryMessage)
        });
}

async function objectSubmit() {
    const sentEntry = await Endpoint.connection()
        .inbox('INBOX_ID')
        .sendData({
            data: serializeObject({
                type: 'General inquiry',
                answer: 'Example answer'
            })
        });
}

async function submitFile() {
    const files: File[] = [
        /*e.g. Files picked by user from their browser*/
    ];

    await Endpoint.connection()
        .inbox('INBOX_ID')
        .sendData({
            data: serializeObject({
                inquiryType: 'newsletter',
                answer: 'email@domain.com'
            }),
            files: files.map((file) => ({
                data: file,
                privateMeta: serializeObject({
                    name: file.name,
                    mimetype: file.type
                })
            }))
        });
}

//fetching

async function mostRecentEntries() {
    const entryList = await Endpoint.connection().inbox('INBOX_ID').listEntries();

    const parsedEntries = entryList.readItems.map((entry) => {
        const deserializedData = deserializeObject(entry.data);
        return {
            ...entry,
            data: deserializedData
        };
    });
}

async function oldestEntries() {
    const storeList = await Endpoint.connection().inbox('INBOX_ID').listEntries(0, {
        sort: 'asc'
    });
}

async function fetchFile() {
    const sentEntry = await Endpoint.connection()
        .inbox('INBOX_ID')
        .sendData({
            data: serializeObject({
                inquiryType: 'newsletter',
                answer: 'email@domain.com'
            }),
            files: files.map((file) => ({
                data: file,
                privateMeta: serializeObject({
                    name: file.name,
                    mimetype: file.type
                })
            }))
        });

    const entryList = await Endpoint.connection().inbox('INBOX_ID').listEntries();
    const deserializedEntries = entryList.readItems.map((entry) => {
        return {
            ...entry,
            data: deserializeObject(entry.data),
            files: entry.files.map((file) => ({
                ...file,
                privateMeta: deserializeObject(file.privateMeta)
            }))
        };
    });

    const entryFile = deserializedEntries[0].files[0];

    await Endpoint.connection().inboxes.downloadFile({
        fileId: entryFile.info.fileId,
        fileName: entryFile.privateMeta['name']
    });
}
