export interface CryptoApiInterface {
    /**
     * Decrypts buffer with a given key using AES.
     * @param {Uint8Array} data the buffer to decrypt
     * @param {Uint8Array} key the key used to decrypt data
     * @returns {Promise<Uint8Array>} String plain (decrypted) data buffer.
     */
    decryptDataSymmetric: (data: Uint8Array, key: Uint8Array) => Promise<Uint8Array>;
    /**
     * Encrypts buffer with a given key using AES.
     * @param {Uint8Array} data - the buffer to encrypt
     * @param {Uint8Array} key - the key used to encrypt data
     * @returns {Promise<Uint8Array>} String encrypted data buffer.
     */
    encryptDataSymmetric: (data: Uint8Array, key: Uint8Array) => Promise<Uint8Array>;
    /**
     * Converts a given private key in PEM format to its WIF format.
     * @param {string} keyPEM - the private key to convert
     * @returns {Promise<string>} String private key in WIF format.
     */
    convertPEMKeyToWIFKey: (keyPEM: string) => Promise<string>;
    /**
     * Generates a new private ECC key.
     * @param {string=} [baseString] - optional string used as the base to generate the new key
     * @returns {Promise<string>} String generated ecc key in WIF format.
     */
    generatePrivateKey: (baseString?: string) => Promise<string>;

    /**
     * Generates crypto public key

     * @param {string} privKey - private ECC key in WIF format
     * @returns {Promise<string>} String generated ECC key in BASE58DER format.
     */
    derivePublicKey: (privKey: string) => Promise<string>;
    /**
     * Creates a signature of given data and key.
     * @param {Uint8Array} data - buffer to sign
     * @param {string} privKey - the key used to sign data
     * @returns {Promise<Uint8Array>} String signature.
     */
    signData: (data: Uint8Array, privKey: string) => Promise<Uint8Array>;

    /**
     * Validate a signature of data using given key.
     *
     * @param {Uint8Array} data
     * @param {Uint8Array} signature tof data
     * @param {string} publicKey ECC key in BASE58DER format used to validate data
     * @return {boolean} validated data
     */
    verifySignature: (
        data: Uint8Array,
        signature: Uint8Array,
        publicKey: string
    ) => Promise<boolean>;

    /**
     * Generates a new private ECC key from a password using pbkdf2.
     * @param {string} salt - the password used to generate the new key
     * @param {string} password - string generated ecc key in WIF format
     * @returns {Promise<string>} String signature.
     */
    derivePrivateKey: (salt: string, password: string) => Promise<string>;

    /**
     * Generates a new symmetric key signData a `Uint8Array`.
     * This function uses a cryptographic algorithm to create a secure random key.
     *
     * @returns {Promise<Uint8Array>} generated symmetric key.
     *
     */
    generateKeySymmetric: () => Promise<Uint8Array>;

    /**
     * Derives a symmetric key from a password and salt using a key derivation function (e.g., PBKDF2, scrypt, etc.).
     *
     * @param {string} password - The input password used to derive the key.
     * @param {string} salt - A unique string used to ensure that the same password generates different keys.
     *
     * @returns {Promise<Uint8Array>} generated derived key.
     *
     */
    deriveKeySymmetric: (password: string, salt: string) => Promise<Uint8Array>;
}
