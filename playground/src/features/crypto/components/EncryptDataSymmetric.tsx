'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PrivmxCrypto } from '@simplito/privmx-webendpoint-sdk';
import { CopyButton } from '@/components/ui/copy-button';

export function EncryptDataSymmetric() {
    const [data, setData] = useState<string>('');
    const [symmetricKey, setSymmetricKey] = useState<string>('');
    const [encryptedData, setEncryptedData] = useState<string>('');

    const handleEncrypt = async () => {
        try {
            const dataArray = new TextEncoder().encode(data);
            const keyArray = new Uint8Array(symmetricKey.split(',').map(Number));
            const encrypted = await PrivmxCrypto.encryptDataSymmetric(dataArray, keyArray);
            setEncryptedData(Array.from(encrypted).join(','));
        } catch (error) {
            console.error('Encryption failed:', error);
            setEncryptedData(`Encryption failed: ${error}`);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="data">Data to Encrypt:</Label>
                <Textarea
                    id="data"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    placeholder="Enter data to encrypt"
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
            <Button onClick={handleEncrypt}>Encrypt</Button>
            {encryptedData && (
                <Alert>
                    <AlertTitle className="flex justify-between items-center">
                        Encrypted Data (comma-separated bytes)
                        <CopyButton text={encryptedData} />
                    </AlertTitle>
                    <AlertDescription className="break-all">{encryptedData}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
