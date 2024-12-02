'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PrivmxCrypto } from '@simplito/privmx-webendpoint-sdk';
import { CopyButton } from '@/components/ui/copy-button';

export function GeneratePrivateKey() {
    const [randomSeed, setRandomSeed] = useState<string>('');
    const [privateKey, setPrivateKey] = useState<string>('');

    const handleGenerate = async () => {
        try {
            const key = await PrivmxCrypto.generatePrivateKey(randomSeed || undefined);
            setPrivateKey(key);
        } catch (error) {
            console.error('Generation failed:', error);
            setPrivateKey(`Generation failed: ${error}`);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="randomSeed">Random Seed (optional):</Label>
                <Input
                    id="randomSeed"
                    value={randomSeed}
                    onChange={(e) => setRandomSeed(e.target.value)}
                    placeholder="Enter random seed (optional)"
                />
            </div>
            <Button onClick={handleGenerate}>Generate Private Key</Button>
            {privateKey && (
                <Alert>
                    <AlertTitle className="flex justify-between items-center">
                        Generated Private Key
                        <CopyButton text={privateKey} />
                    </AlertTitle>
                    <AlertDescription className="break-all">{privateKey}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
