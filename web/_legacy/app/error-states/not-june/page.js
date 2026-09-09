'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import WalletConnect from '../../components/WalletConnect';

export default function NotVerityPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="fixed top-6 right-6 z-50">
        <WalletConnect />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-12 fade-in">
          <div className="space-y-4">
            <p className="text-white/40 font-mono text-sm tracking-widest uppercase">
              Identity Confirmed
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-mono leading-tight">
              Hi, (not) Verity.
            </h1>
          </div>

          <div className="terminal-box text-left space-y-4 max-w-lg mx-auto">
            <p className="text-white/70 leading-relaxed">
              You hold a valid NOT-VERITY token. Your non-identity has been
              recorded and verified through zero-knowledge proofs.
            </p>
            <p className="text-white/40 text-xs">
              This proves you are not Verity, without revealing who you are.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-delay">
            <Link href="/collection" className="btn-primary">
              VIEW COLLECTION
            </Link>
            <Link href="/identity-creation/stage-1?type=invalid-duplicate" className="btn-secondary">
              DUPLICATE ID
            </Link>
          </div>

          <Link href="/" className="inline-block text-white/30 font-mono text-xs hover:text-white/60 transition fade-in-delay-2">
            Back to main
          </Link>
        </div>
      </main>
    </div>
  );
}
