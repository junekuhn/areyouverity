'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import WalletConnect from '../../components/WalletConnect';

export default function InvalidIdPage() {
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
              Identity Status
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-mono leading-tight">
              Hi?
            </h1>
          </div>

          <div className="terminal-box text-left space-y-4 max-w-lg mx-auto">
            <p className="text-white/70 leading-relaxed">
              You currently own an invalid ID, and you should consider
              carrying one that is valid.
            </p>
            <p className="text-white/40 text-xs">
              Verity, I&apos;m sorry but your ID is invalid.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-delay">
            <Link href="/identity-creation/stage-1" className="btn-primary">
              CREATE NEW VALID ID
            </Link>
            <Link href="/collection" className="btn-secondary">
              VIEW COLLECTION
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-delay-2">
            <Link href="/" className="btn-secondary">
              BACK TO MAIN
            </Link>
            <Link href="/burn" className="btn-danger">
              BURN INVALID ID
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
