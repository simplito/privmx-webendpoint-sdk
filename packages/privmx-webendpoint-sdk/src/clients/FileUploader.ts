import { StoreApi } from '../api/store/StoreApi';
import { FILE_MAX_CHUNK_SIZE } from '../utils/const';

/**
 * Represents a file stream uploader for uploading a Browser FileHandle in chunks.
 */

export class FileUploader {
    private _handle: number;
    private _offset: number;
    private _size: number;
    private _api: StoreApi;
    private _reader: ReadableStreamDefaultReader<Uint8Array>;

    /**
     * Creates an instance of FileUploader.
     *
     * @param {number} handle - The file handle.
     * @param {File} file - The data (file content) to upload.
     * @param {StoreApi} api {@link StoreApi `StoreApi`} instance
     * @param {number} [offset=0] - The starting offset for uploading.
     */

    constructor(handle: number, file: File, api: StoreApi, offset: number = 0) {
        this._handle = handle;
        this._size = file.size;
        this._api = api;
        this._offset = offset;
        this._reader = file.stream().getReader();

        if (this._size === 0) {
            throw new Error('Cannot upload an empty file.');
        }
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
        const { done, value } = await this._reader.read();

        if (done) {
            return false;
        }

        let localOffset = 0;

        while (localOffset < value.length) {
            const chunkSize = Math.min(FILE_MAX_CHUNK_SIZE, value.length - localOffset);
            const chunk = value.subarray(localOffset, localOffset + chunkSize);
            await this._api.writeToFile(this._handle, chunk);

            localOffset += chunkSize;
        }
        this._offset += value.length;

        return this._offset < this._size;
    }

    /**
     * Aborts the uploading process, closes the file handle, and deletes the uploaded part of the file.
     *
     * @returns {Promise<void>} A promise that resolves when the file handle is closed and the uploaded part is deleted.
     */

    public async abort(): Promise<void> {
        await this._api.deleteFile(await this._api.closeFile(this._handle));
    }

    /**
     * Closes the file handle.
     *
     * @returns {Promise<string>} A promise that resolves when the file handle is closed and returns file ID.
     */
    public async close(): Promise<string> {
        this._reader.releaseLock();
        return await this._api.closeFile(this._handle);
    }
}
