import { InboxApi } from '../api/inbox/InboxApi';
import { FILE_MAX_CHUNK_SIZE } from '../utils/const';

/**
 * Represents a stream uploader for uploading a file in chunks.
 */

export class InboxFileUploader {
    private _inboxHandle: number;
    private _fileHandle: number;
    private _data: Uint8Array | File;
    private _size: number;
    private _offset: number;
    private _api: InboxApi;
    private _type: 'file' | 'bytearray';
    private _reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    /**
     * Creates an instance of StreamUploader.
     * @param {InboxApi} api {@link InboxApi `InboxApi`} instance
     * @param {number} inboxHandle handle to the Inbox
     * @param {number} fileHandle file handle
     * @param {Uint8Array} data The data (file content) to upload.
     * @param {number} [offset=0] - The starting offset for uploading.
     */
    constructor(
        api: InboxApi,
        inboxHandle: number,
        fileHandle: number,
        data: Uint8Array | File,
        offset: number = 0
    ) {
        this._api = api;
        this._inboxHandle = inboxHandle;
        this._fileHandle = fileHandle;
        this._data = data;
        this._offset = offset;
        if (data instanceof Uint8Array) {
            this._size = data.length;
            this._type = 'bytearray';
        } else {
            this._size = data.size;
            this._type = 'file';
            this._reader = data.stream().getReader();
        }
    }

    /**
     * Gets the progress of uploading the file as a percentage.
     *
     * @returns {number} The progress percentage.
     */
    public get progress(): number {
        return (this._offset / this._size) * 100;
    }

    /**
     * Sends the next chunk of the file data to the server.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if there are more chunks to send, or false if all data has been sent.
     */

    public async sendNextChunk(): Promise<boolean> {
        if (this._type === 'file') {
            return await this.sendFileChunk();
        } else {
            return await this.sendDataChunk();
        }
    }

    private async sendFileChunk(): Promise<boolean> {
        if (this._data instanceof Uint8Array || !this._reader) {
            throw new Error('wrong data type');
        }

        const { done, value } = await this._reader.read();

        if (done) {
            return false;
        }

        let localOffset = 0;

        while (localOffset < value.length) {
            const chunkSize = Math.min(FILE_MAX_CHUNK_SIZE, value.length - localOffset);
            const chunk = value.subarray(localOffset, localOffset + chunkSize);
            await this._api.writeToFile(this._inboxHandle, this._fileHandle, chunk);

            localOffset += chunkSize;
        }
        this._offset += value.length;

        return this._offset < this._size;
    }

    private async sendDataChunk(): Promise<boolean> {
        if (!(this._data instanceof Uint8Array)) {
            throw new Error('wrong data type');
        }
        const nextChunkSize = Math.min(this._size - this._offset, FILE_MAX_CHUNK_SIZE);
        if (nextChunkSize <= 0) {
            return false;
        }
        const chunk = this._data.slice(this._offset, this._offset + nextChunkSize);
        await this._api.writeToFile(this._inboxHandle, this._fileHandle, chunk);
        this._offset += nextChunkSize;

        return this._offset < this._size;
    }
}
