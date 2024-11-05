import { StoreApi } from '../api/store/StoreApi';
import { FILE_MAX_CHUNK_SIZE } from '../utils/const';

/**
 * Represents a stream uploader for uploading a file in chunks.
 */

export class StreamUploader {
    private _handle: number;
    private _offset: number;
    private _size: number;
    private _data: Uint8Array;
    private _api: StoreApi;

    /**
     * Creates an instance of StreamUploader.
     *
     * @param {number} handle - The file handle.
     * @param {Uint8Array} data - The data (file content) to upload.
     * @param {StoreApi} api {@link StoreApi `StoreApi`} instance
     * @param {number} [offset=0] - The starting offset for uploading.
     */

    constructor(handle: number, data: Uint8Array, api: StoreApi, offset: number = 0) {
        this._handle = handle;
        this._size = data.length;
        this._data = data;
        this._api = api;
        this._offset = offset;
    }

    /**
     * Gets the progress of uploading the file as a percentage.
     *
     * @returns {number} The progress percentage.
     */
    public get progress() {
        return (this._offset / this._size) * 100;
    }

    /**
     * Sends the next chunk of the file data to the server.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if there are more chunks to send, or false if all data has been sent.
     */

    public async sendNextChunk(): Promise<boolean> {
        const nextChunkSize = Math.min(this._size - this._offset, FILE_MAX_CHUNK_SIZE);
        if (nextChunkSize <= 0) {
            return false;
        }
        const chunk = this._data.slice(this._offset, this._offset + nextChunkSize);
        await this._api.writeToFile(this._handle, chunk);
        this._offset += nextChunkSize;

        return this._offset < this._size;
    }

    /**
     * Aborts the uploading process, closes the file handle, and deletes the uploaded part of the file.
     *
     * @returns {Promise<void>} A promise that resolves when the file handle is closed and the uploaded part is deleted.
     */

    public async abort(): Promise<void> {
        const fileId = await this._api.closeFile(this._handle);
        await this._api.deleteFile(fileId);
    }

    /**
     * Closes the file handle.
     *
     * @returns {Promise<string>} A promise that resolves when the file handle is closed and returns file ID.
     */
    public async close(): Promise<string> {
        return await this._api.closeFile(this._handle);
    }
}
