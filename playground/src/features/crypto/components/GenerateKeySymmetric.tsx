'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PrivmxCrypto } from '@simplito/privmx-webendpoint-sdk';
import { CopyButton } from '@/components/ui/copy-button';

export function GenerateKeySymmetric() {
    const [symmetricKey, setSymmetricKey] = useState<string>('');

    const handleGenerate = async () => {
        try {
            const key = await PrivmxCrypto.generateKeySymmetric();
            setSymmetricKey(Array.from(key).join(','));
        } catch (error) {
            console.error('Generation failed:', error);
            setSymmetricKey(`Generation failed: ${error}`);
        }
    };

    return (
        <div className="space-y-4">
            <Button onClick={handleGenerate}>Generate Symmetric Key</Button>
            {symmetricKey && (
                <Alert>
                    <AlertTitle className="flex justify-between items-center">
                        Generated Symmetric Key (comma-separated bytes)
                        <CopyButton text={symmetricKey} />
                    </AlertTitle>
                    <AlertDescription className="break-all">{symmetricKey}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
