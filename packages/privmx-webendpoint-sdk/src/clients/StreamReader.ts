import { InboxApi } from '../api/inbox/InboxApi';
import { StoreApi } from '../api/store/StoreApi';
import { FILE_MAX_CHUNK_SIZE } from '../utils/const';

/**
 * Represents a stream reader for reading a file in chunks.
 */

export class StreamReader {
    private _data: Uint8Array;
    private _handle: number;
    private _offset: number;
    private _size: number;
    private _api: StoreApi | InboxApi;

    /**
     * Creates an instance of StreamReader.
     *
     * @param {number} handle - The file handle.
     * @param {StoreApi} api {@link StoreApi `StoreApi`} instance
     */

    constructor(handle: number, api: StoreApi | InboxApi) {
        this._handle = handle;
        this._data = new Uint8Array();
        this._size = 0;
        this._offset = 0;
        this._api = api;
    }

    /**
     * Gets the progress of reading the file as a percentage.
     *
     * @returns {number} The progress percentage.
     */

    public get progress(): number {
        return (this._offset / this._size) * 100;
    }

    /**
     * Gets the data read so far.
     *
     * @returns {Uint8Array} The data read so far.
     */

    public get data(): Uint8Array {
        return this._data;
    }

    /**
     * Reads the next chunk of the file.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if there are more chunks to read, or false if the end of the file is reached.
     */

    public async readNextChunk(): Promise<boolean> {
        const chunk = await this._api.readFromFile(this._handle, FILE_MAX_CHUNK_SIZE);
        let newData = new Uint8Array(this._data.length + chunk.length);
        newData.set(this._data);
        newData.set(chunk, this._data.length);
        this._data = newData;
        this._offset += chunk.length;

        if (chunk.length < 1048576) {
            return false;
        }

        return true;
    }

    /**
     * Aborts the reading process and closes the file handle.
     *
     * @returns {Promise<string>} A promise that resolves when the file handle is closed.
     */

    public async abort(): Promise<string> {
        return await this._api.closeFile(this._handle);
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
