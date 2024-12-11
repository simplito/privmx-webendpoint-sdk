'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PrivmxCrypto } from '@simplito/privmx-webendpoint-sdk';
import { CopyButton } from '@/components/ui/copy-button';

export function SignData() {
    const [data, setData] = useState<string>('');
    const [privateKey, setPrivateKey] = useState<string>('');
    const [signature, setSignature] = useState<string>('');

    const handleSign = async () => {
        try {
            const dataArray = new TextEncoder().encode(data);
            const sig = await PrivmxCrypto.signData(dataArray, privateKey);
            setSignature(Array.from(sig).join(','));
        } catch (error) {
            console.error('Signing failed:', error);
            setSignature(`Signing failed: ${error}`);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="data">Data to Sign:</Label>
                <Textarea
                    id="data"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    placeholder="Enter data to sign"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="privateKey">Private Key (WIF format):</Label>
                <Input
                    id="privateKey"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter private key in WIF format"
                />
            </div>
            <Button onClick={handleSign}>Sign Data</Button>
            {signature && (
                <Alert>
                    <AlertTitle className="flex justify-between items-center">
                        Signature (comma-separated bytes)
                        <CopyButton text={signature} />
                    </AlertTitle>
                    <AlertDescription className="break-all">{signature}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
