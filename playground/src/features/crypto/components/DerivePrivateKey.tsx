'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PrivmxCrypto } from '@simplito/privmx-webendpoint-sdk';
import { CopyButton } from '@/components/ui/copy-button';

export function DerivePrivateKey() {
    const [salt, setSalt] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [derivedKey, setDerivedKey] = useState<string>('');

    const handleDerive = async () => {
        try {
            const key = await PrivmxCrypto.derivePrivateKey(salt, password);
            setDerivedKey(key);
        } catch (error) {
            console.error('Derivation failed:', error);
            setDerivedKey(`Derivation failed: ${error}`);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="salt">Salt:</Label>
                <Input
                    id="salt"
                    value={salt}
                    onChange={(e) => setSalt(e.target.value)}
                    placeholder="Enter salt"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password:</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                />
            </div>
            <Button onClick={handleDerive}>Derive Private Key</Button>
            {derivedKey && (
                <Alert>
                    <AlertTitle className="flex justify-between items-center">
                        Derived Private Key
                        <CopyButton text={derivedKey} />
                    </AlertTitle>
                    <AlertDescription className="break-all">{derivedKey}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
