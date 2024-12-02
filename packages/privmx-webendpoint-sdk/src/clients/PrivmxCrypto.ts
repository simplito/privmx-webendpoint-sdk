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
     * Decrypts buffer with a given key using AES.
     *
     * @param {Uint8Array} data buffer to decrypt
     * @param {Uint8Array} symmetricKey key used to decrypt data
     * @returns {Uint8Array} plain (decrypted) data buffer
     */
    static async decryptDataSymmetric(
        data: Uint8Array,
        symmetricKey: Uint8Array
    ): Promise<Uint8Array> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const decrypted = await cryptoApi.decryptDataSymmetric(data, symmetricKey);
        return decrypted;
    }

    /**
     * Encrypts buffer with a given key using AES.
     *
     * @param {Uint8Array} data buffer to encrypt
     * @param {Uint8Array} symmetricKey key used to encrypt data
     * @returns {Uint8Array} encrypted data buffer
     */
    static async encryptDataSymmetric(
        data: Uint8Array,
        symmetricKey: Uint8Array
    ): Promise<Uint8Array> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const encrypted = await cryptoApi.encryptDataSymmetric(data, symmetricKey);
        return encrypted;
    }
    /**
     * Converts given private key in PEM format to its WIF format.
     *
     * @param {string} pemKey private key to convert
     * @returns {string} private key in WIF format
     */
    static async convertPEMKeytoWIFKey(pemKey: string): Promise<string> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const wifKey = await cryptoApi.convertPEMKeytoWIFKey(pemKey);
        return wifKey;
    }

    /**
     * Generates a new private ECC key.
     *
     * @param {string} [randomSeed] optional string used as the base to generate the new key
     * @returns {string} generated ECC key in WIF format
     */
    static async generatePrivateKey(randomSeed?: string): Promise<string> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const privKey = await cryptoApi.generatePrivateKey(randomSeed);
        return privKey;
    }

    /**
     * Generates a new public ECC key as a pair to an existing private key.
     * @param {string} privateKey private ECC key in WIF format
     * @returns {string} generated ECC key in BASE58DER format
     */
    static async derivePublicKey(privateKey: string): Promise<string> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const pubKey = await cryptoApi.derivePublicKey(privateKey);
        return pubKey;
    }

    /**
     * Creates a signature of data using given key.
     *
     * @param {Uint8Array} data buffer to sign
     * @param {string} privateKey key used to sign data
     * @returns {Uint8Array} signature
     */
    static async signData(data: Uint8Array, privateKey: string): Promise<Uint8Array> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const signature = await cryptoApi.signData(data, privateKey);
        return signature;
    }

    /**
     * Generates a new private ECC key from a password using pbkdf2.
     *
     * @param {string} password the password used to generate the new key
     * @param {string} salt random string (additional input for the hashing function)

     * @returns {string} generated ECC key in WIF format
     */
    static async derivePrivateKey(salt: string, password: string): Promise<string> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const privKey = await cryptoApi.derivePrivateKey(salt, password);
        return privKey;
    }

    /**
     * Generates a new symmetric key.
     * @returns {Uint8Array} generated key.
     */
    static async generateKeySymmetric(): Promise<Uint8Array> {
        const cryptoApi = await PrivmxCrypto.getCryptoApi();
        const key = await cryptoApi.generateKeySymmetric();
        return key;
    }
}
