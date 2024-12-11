'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PrivmxCrypto } from '@simplito/privmx-webendpoint-sdk';
import { CopyButton } from '@/components/ui/copy-button';

export function DecryptDataSymmetric() {
    const [data, setData] = useState<string>('');
    const [symmetricKey, setSymmetricKey] = useState<string>('');
    const [decryptedData, setDecryptedData] = useState<string>('');

    const handleDecrypt = async () => {
        try {
            const dataArray = new Uint8Array(data.split(',').map(Number));
            const keyArray = new Uint8Array(symmetricKey.split(',').map(Number));
            const decrypted = await PrivmxCrypto.decryptDataSymmetric(dataArray, keyArray);
            setDecryptedData(new TextDecoder().decode(decrypted));
        } catch (error) {
            console.error('Decryption failed:', error);
            setDecryptedData(`Decryption failed: ${error}`);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="data">Encrypted Data (comma-separated bytes):</Label>
                <Input
                    id="data"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    placeholder="e.g., 1,2,3,4,5"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="symmetricKey">Symmetric Key (comma-separated bytes):</Label>
                <Input
                    id="symmetricKey"
                    value={symmetricKey}
                    onChange={(e) => setSymmetricKey(e.target.value)}
                    placeholder="e.g., 10,20,30,40,50"
                />
            </div>
            <Button onClick={handleDecrypt}>Decrypt</Button>
            {decryptedData && (
                <Alert>
                    <AlertTitle className="flex justify-between items-center">
                        Decrypted Data
                        <CopyButton text={decryptedData} />
                    </AlertTitle>
                    <AlertDescription>{decryptedData}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
