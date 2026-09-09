'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import WalletConnect from './WalletConnect';
import { useIdentity } from '@/hooks/useIdentity';

const CHIP = {
  NONE: { cls: '', label: 'UNDECLARED' },
  VALID_VERITY: { cls: 'valid', label: 'VERITY · VALID' },
  VALID_NOTVERITY: { cls: 'valid', label: 'NOTVERITY · VALID' },
  QUESTIONING: { cls: 'questioning', label: 'QUESTIONING' },
  VOID: { cls: 'void', label: 'VOID' },
  PARADOX: { cls: 'questioning', label: 'PARADOX' },
};

export default function SiteHeader() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { summary } = useIdentity(isConnected ? address : undefined);

  useEffect(() => setMounted(true), []);

  const chip = CHIP[summary] || CHIP.NONE;

  return (
    <header className="site-header">
      <Link href="/" className="wordmark">
        ARE YOU <b>VERITY</b>?
      </Link>
      <div className="flex items-center gap-4">
        {/* {mounted && summary !== 'NONE' && (
          <span className={`chip ${chip.cls}`}>{chip.label}</span>
        )} */}
        <WalletConnect />
      </div>
    </header>
  );
}
