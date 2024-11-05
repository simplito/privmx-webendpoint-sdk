import { deserializeObject, Endpoint, serializeObject } from '@simplito/privmx-webendpoint-sdk';

async function basicUpload() {

    const file = 'FILE_SELECTED_BY_USER'; // e.g. from a form (FormData.get('file'));

    const fileId = await Endpoint.connection().store('STORE_ID').uploadFile({
        file: file
    });

    const fileInfo = await Endpoint.connection().stores.getFileMetadata(fileId);
}

async function withMetaData() {
    const store = Endpoint.connection().store('STORE_ID');

    const file = 'FILE_SELECTED_BY_USER'; // e.g. from a form (FormData.get('file'));

    const fileId = await store.uploadFile({
        file: file,
        privateMeta: serializeObject({
            name: file.name,
            mimetype: file.type
        })
    });

    const fileInfo = await Endpoint.connection().stores.getFileMetadata(fileId);
    const filePrivateMeta = deserializeObject(fileInfo.privateMeta);
    const deserializedFile = { ...fileInfo, name: filePrivateMeta.name, mimetype: filePrivateMeta.mimetype };
}

async function listOfFiles() {
    const store = Endpoint.connection().store('STORE_ID');
    const file = 'FILE_SELECTED_BY_USER'; // e.g. from a form (FormData.get('file'));

    const fileId = await store.uploadFile({
        file: file,
        privateMeta: serializeObject({
            name: file.name,
            mimetype: file.type
        })
    });

    const fileList = await store.getFiles();

    const parsedObjects = fileList.readItems.map(file => {
        const fileMeta = deserializeObject(file.privateMeta);
        return {
            ...file,
            name: fileMeta.name,
            mimetype: fileMeta.mimetype
        };
    });
}

// Modyfing files

async function changingName() {

    const currentFileMeta = await Endpoint.connection().stores.getFileMetadata('FILE_ID');

    const deserializedFileMeta = deserializeObject(currentFileMeta.privateMeta);
    const newFilePrivateMeta = {
        ...deserializedFileMeta,
        name: 'New file meta'
    };

    await Endpoint.connection().stores.updateFileMetaData({
        fileId: 'FILE_ID',
        privateMeta: serializeObject(newFilePrivateMeta)
    });
}

async function overridingFileContext() {
    const currentFileMeta = await Endpoint.connection().stores.getFileMetadata('FILE_ID');

    const deserializedFileMeta = deserializeObject(currentFileMeta.privateMeta);
    const newFilePrivateMeta = {
        ...deserializedFileMeta,
        name: 'New file meta'
    };
    const newFileData = serializeObject({ text: 'OK' });

    await Endpoint.connection().stores.overrideFile({
        fileId: FILE_ID,
        file: {
            data: newFileData,
            privateMeta: serializeObject(newFilePrivateMeta)
        }
    });
}

async function deletingFIle() {
    await Endpoint.connection().stores.deleteFile('FILE_ID');
}