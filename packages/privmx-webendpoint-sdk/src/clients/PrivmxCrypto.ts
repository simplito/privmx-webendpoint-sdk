import { CryptoApi } from '../api/crypto/CryptoApi';
import { EndpointFactoryProvider } from '../EndpointFactory';

/**
 * Wrapper class for the build in Crypto.
 */
export class PrivmxCrypto {
    private static cryptoApi: CryptoApi | null = null;

    private static async getCryptoApi() {
        if (PrivmxCrypto.cryptoApi) {
            return PrivmxCrypto.cryptoApi;
        }

        const cryptoApi = await EndpointFactoryProvider.createCryptoApi();
        PrivmxCrypto.cryptoApi = cryptoApi;

        return cryptoApi;
    }

    /**
     * Decrypts given data using the provided key.
     * @param {Uint8Array} data - data to decrypt
     * @param {string} key - key to use for decryption
     * @returns {Promise<string>} decrypted data
     */
    static async decryptDataSymmetric(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const decrypted = await cryptoApi.decryptDataSymmetric(data, key);
        return decrypted;
    }

    /**
     * Encrypts given data using the provided key.
     * @param {Uint8Array} data - data to encrypt
     * @param {string} key - key to use for encryption
     * @returns {Promise<string>} encrypted data
     */
    static async encryptDataSymmetric(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const encrypted = await cryptoApi.encryptDataSymmetric(data, key);
        return encrypted;
    }

    /**
     * Converts a PEM key to WIF format.
     * @param {string} keyPEM - PEM key to convert
     * @returns {Promise<string>} WIF formatted key
     */
    static async convertPEMKeyToWIFKey(keyPEM: string): Promise<string> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const wifKey = await cryptoApi.convertPEMKeyToWIFKey(keyPEM);
        return wifKey;
    }

    /**
     * Generates a new private key.
     * @param {string} [baseString] - optional base string to use for key generation
     * @returns {Promise<string>} generated private key
     */
    static async generatePrivateKey(baseString?: string): Promise<string> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const privKey = await cryptoApi.generatePrivateKey(baseString);
        return privKey;
    }

    /**
     * Generates a new public key from given private key.
     * @param {string} privKey - private key to use for generating the public key
     * @returns {Promise<string>} generated public key
     */
    static async derivePublicKey(privKey: string): Promise<string> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const pubKey = await cryptoApi.derivePublicKey(privKey);
        return pubKey;
    }

    /**
     * Signs given data using the provided private key.
     * @param {Uint8Array} data - data to sign
     * @param {string} privKey - private key to use for signing
     * @returns {Promise<string>} signature
     */
    static async signData(data: Uint8Array, privKey: string): Promise<Uint8Array> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const signature = await cryptoApi.signData(data, privKey);
        return signature;
    }

    /**
     * Generates a new private key using PBKDF2.
     * @param {string} salt - salt to use for key generation
     * @param {string} password - password to use for key generation
     * @returns {Promise<string>} generated private key
     */
    static async derivePrivateKey(salt: string, password: string): Promise<string> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const privKey = await cryptoApi.derivePrivateKey(salt, password);
        return privKey;
    }

    /**
     * Derives a symmetric key from a password and salt using a key derivation function.
     *
     * @param {string} password - input password used to derive the key
     * @param {string} salt - a unique string used to ensure that the same password generates different keys
     *
     * @returns {Promise<Uint8Array>} generated derived key
     *
     */
    static async deriveKeySymmetric(password: string, salt: string): Promise<Uint8Array> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const key = await cryptoApi.deriveKeySymmetric(salt, password);
        return key;
    }

    /**
     * Generates a new symmetric key signData a `Uint8Array`.
     * This function uses a cryptographic algorithm to create a secure random key.
     *
     * @returns {Promise<Uint8Array>} generated symmetric key
     *
     */
    static async generateKeySymmetric(): Promise<Uint8Array> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const key = await cryptoApi.generateKeySymmetric();
        return key;
    }

    /**
     * Validate a signature of data using given key.
     *
     * @param data buffer
     * @param signature tof data
     * @param publicKey public ECC key in BASE58DER format used to validate data
     * @return validated data
     */

    static async verifySignature(data: Uint8Array, signature: Uint8Array, publicKey: string) {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        return cryptoApi.verifySignature(data, signature, publicKey);
    }
}
