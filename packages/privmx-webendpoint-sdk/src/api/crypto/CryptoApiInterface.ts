export interface CryptoApiInterface {
    /**
     * Creates a signature of data using given key.
     *
     * @param {Uint8Array} data buffer to sign
     * @param {string} privateKey key used to sign data
     * @returns {Uint8Array} signature
     */
    signData(data: Uint8Array, privateKey: string): Promise<Uint8Array>;

    /**
     * Generates a new private ECC key.
     *
     * @param {string} [randomSeed] optional string used as the base to generate the new key
     * @returns {string} generated ECC key in WIF format
     */
    generatePrivateKey(randomSeed?: string): Promise<string>;

    /**
     * Generates a new private ECC key from a password using pbkdf2.
     *
     * @param {string} password the password used to generate the new key
     * @param {string} salt random string (additional input for the hashing function)

     * @returns {string} generated ECC key in WIF format
     */
    derivePrivateKey(password: string, salt: string): Promise<string>;

    /**
     * Generates a new public ECC key as a pair to an existing private key.
     * @param {string} privateKey private ECC key in WIF format
     * @returns {string} generated ECC key in BASE58DER format
     */
    derivePublicKey(privateKey: string): Promise<string>;

    /**
     * Generates a new symmetric key.
     * @returns {Uint8Array} generated key.
     */
    generateKeySymmetric(): Promise<Uint8Array>;

    /**
     * Encrypts buffer with a given key using AES.
     *
     * @param {Uint8Array} data buffer to encrypt
     * @param {Uint8Array} symmetricKey key used to encrypt data
     * @returns {Uint8Array} encrypted data buffer
     */
    encryptDataSymmetric(data: Uint8Array, symmetricKey: Uint8Array): Promise<Uint8Array>;

    /**
     * Decrypts buffer with a given key using AES.
     *
     * @param {Uint8Array} data buffer to decrypt
     * @param {Uint8Array} symmetricKey key used to decrypt data
     * @returns {Uint8Array} plain (decrypted) data buffer
     */
    decryptDataSymmetric(data: Uint8Array, symmetricKey: Uint8Array): Promise<Uint8Array>;

    /**
     * Converts given private key in PEM format to its WIF format.
     *
     * @param {string} pemKey private key to convert
     * @returns {string} private key in WIF format
     */
    convertPEMKeytoWIFKey(pemKey: string): Promise<string>;
}
