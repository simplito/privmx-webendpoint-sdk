'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PrivmxCrypto } from '@simplito/privmx-webendpoint-sdk';
import { CopyButton } from '@/components/ui/copy-button';

export function DerivePublicKey() {
    const [privateKey, setPrivateKey] = useState<string>('');
    const [publicKey, setPublicKey] = useState<string>('');

    const handleDerive = async () => {
        try {
            const key = await PrivmxCrypto.derivePublicKey(privateKey);
            setPublicKey(key);
        } catch (error) {
            console.error('Derivation failed:', error);
            setPublicKey(`Derivation failed: ${error}`);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="privateKey">Private Key (WIF format):</Label>
                <Input
                    id="privateKey"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter private key in WIF format"
                />
            </div>
            <Button onClick={handleDerive}>Derive Public Key</Button>
            {publicKey && (
                <Alert>
                    <AlertTitle className="flex justify-between items-center">
                        Derived Public Key
                        <CopyButton text={publicKey} />
                    </AlertTitle>
                    <AlertDescription className="break-all">{publicKey}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
