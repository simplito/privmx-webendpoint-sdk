'use client';

import { CryptoCard } from './components/CryptoCard';
import { DecryptDataSymmetric } from './components/DecryptDataSymmetric';
import { EncryptDataSymmetric } from './components/EncryptDataSymmetric';
import { ConvertPEMKeytoWIFKey } from './components/ConvertPEMKeytoWIFKey';
import { GeneratePrivateKey } from './components/GeneratePrivateKey';
import { DerivePublicKey } from './components/DerivePublicKey';
import { SignData } from './components/SignData';
import { DerivePrivateKey } from './components/DerivePrivateKey';
import { GenerateKeySymmetric } from './components/GenerateKeySymmetric';

export function CryptoPage() {
    return (
        <div className="mx-auto p-4">
            <div className="flex flex-col gap-4">
                <CryptoCard title="DecryptDataSymmetric">
                    <DecryptDataSymmetric />
                </CryptoCard>
                <CryptoCard title="EncryptDataSymmetric">
                    <EncryptDataSymmetric />
                </CryptoCard>
                <CryptoCard title="ConvertPEMKeytoWIFKey">
                    <ConvertPEMKeytoWIFKey />
                </CryptoCard>
                <CryptoCard title="GeneratePrivateKey">
                    <GeneratePrivateKey />
                </CryptoCard>
                <CryptoCard title="DerivePublicKey">
                    <DerivePublicKey />
                </CryptoCard>
                <CryptoCard title="SignData">
                    <SignData />
                </CryptoCard>
                <CryptoCard title="DerivePrivateKey">
                    <DerivePrivateKey />
                </CryptoCard>
                <CryptoCard title="GenerateKeySymmetric">
                    <GenerateKeySymmetric />
                </CryptoCard>
            </div>
        </div>
    );
}
