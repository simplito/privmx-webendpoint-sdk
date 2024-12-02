'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PrivmxCrypto } from '@simplito/privmx-webendpoint-sdk';
import { CopyButton } from '@/components/ui/copy-button';

export function ConvertPEMKeytoWIFKey() {
    const [pemKey, setPemKey] = useState<string>('');
    const [wifKey, setWifKey] = useState<string>('');

    const handleConvert = async () => {
        try {
            const wif = await PrivmxCrypto.convertPEMKeytoWIFKey(pemKey);
            setWifKey(wif);
        } catch (error) {
            console.error('Conversion failed:', error);
            setWifKey(`Conversion failed: ${error}`);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="pemKey">PEM Key:</Label>
                <Textarea
                    id="pemKey"
                    value={pemKey}
                    onChange={(e) => setPemKey(e.target.value)}
                    placeholder="Enter PEM key"
                />
            </div>
            <Button onClick={handleConvert}>Convert to WIF</Button>
            {wifKey && (
                <Alert>
                    <AlertTitle className="flex justify-between items-center">
                        WIF Key
                        <CopyButton text={wifKey} />
                    </AlertTitle>
                    <AlertDescription className="break-all">{wifKey}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
