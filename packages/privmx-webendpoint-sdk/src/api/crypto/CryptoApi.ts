import { CryptoApiInterface } from './CryptoApiInterface';

/**
 * Cryptography API from the PrivMX Endpoint Web
 */
export class CryptoApi implements CryptoApiInterface {
    public constructor(private api: CryptoApiInterface) {}

    async signData(data: Uint8Array, privKey: string): Promise<Uint8Array> {
        return await this.api.signData(data, privKey);
    }

    async decryptDataSymmetric(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
        const decrypted = await this.api.decryptDataSymmetric(data, key);
        return decrypted;
    }

    async encryptDataSymmetric(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
        const encrypted = await this.api.encryptDataSymmetric(data, key);
        return encrypted;
    }

    async convertPEMKeytoWIFKey(keyPEM: string): Promise<string> {
        return await this.api.convertPEMKeytoWIFKey(keyPEM);
    }

    async generatePrivateKey(baseString?: string): Promise<string> {
        return await this.api.generatePrivateKey(baseString);
    }

    async derivePublicKey(privKey: string): Promise<string> {
        return await this.api.derivePublicKey(privKey);
    }

    async derivePrivateKey(salt: string, password: string): Promise<string> {
        return await this.api.derivePrivateKey(salt, password);
    }

    async generateKeySymmetric(): Promise<Uint8Array> {
        return await this.api.generateKeySymmetric();
    }
}
