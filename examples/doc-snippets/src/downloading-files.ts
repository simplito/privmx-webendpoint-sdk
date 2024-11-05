import { deserializeObject, Endpoint } from '@simplito/privmx-webendpoint-sdk';

async function fileContents() {
    const fileContent = await Endpoint.connection().stores.getFileContents('FILE_ID');
}

async function basicDownload() {
    const fileContent = await Endpoint.connection().stores.getFileContents('FILE_ID');
}

async function withName() {

    const file = await Endpoint.connection().stores.getFileMetadata('FILE_ID');
    const fileName = deserializeObject(file.publicMeta).name;

    await Endpoint.connection().stores.downloadFile({ fileId: 'FILE_ID', fileName });
}

async function withProgressBar() {

    const file = await Endpoint.connection().stores.getFileMetadata('FILE_ID');
    const fileName = deserializeObject(file.publicMeta).name;

    await Endpoint.connection().stores.downloadFile({
        fileId: 'FILE_ID', fileName, progressCallback: progress => {
            console.log(`Download progres ${progress}`);
        }
    });
}