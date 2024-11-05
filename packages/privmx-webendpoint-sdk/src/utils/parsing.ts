/**
 * Helper function to convert objects to Uint8Array
 * @param {object} object
 * @returns {Uint8Array} object serialized to `Uint8Array`
 */

export function serializeObject(object: Record<string, any>): Uint8Array {
    const encoder = new TextEncoder();
    const parsed = JSON.stringify(object);
    return encoder.encode(parsed);
}

/**
 * Helper function to convert Uint8Array to objects
 * @param {Uint8Array} data
 * @returns {object} parsed JSON object
 */
export function deserializeObject(data: Uint8Array): Record<string, any> {
    const decoder = new TextDecoder();
    const decodedData = decoder.decode(data);

    if (decodedData === '') {
        return {};
    }

    const parsed = JSON.parse(decodedData);
    return parsed;
}
