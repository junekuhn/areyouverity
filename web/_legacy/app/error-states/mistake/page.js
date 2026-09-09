'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import WalletConnect from '../../components/WalletConnect';

export default function MistakePage() {
  const [mounted, setMounted] = useState(false);
  const [claim, setClaim] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setClaim(sessionStorage.getItem('areyouverity_claim'));
    }
  }, []);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="fixed top-6 right-6 z-50">
        <WalletConnect />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-12 fade-in">
          <div className="space-y-4">
            <p className="text-red-400/60 font-mono text-sm tracking-widest uppercase">
              Contradiction Detected
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-mono leading-tight">
              There&apos;s been
              <br />
              a mistake.
            </h1>
          </div>

          <div className="terminal-box text-left space-y-4 max-w-lg mx-auto">
            <p className="text-white/70 leading-relaxed">
              This page appears when either you have a valid ID and click
              that you&apos;re not Verity, or you have a valid invalid ID and
              you click that you are Verity.
            </p>
            <p className="text-white/70 leading-relaxed">
              The ID you used to reach this page has become{' '}
              <span className="text-red-400 font-bold">INVALID</span>.
            </p>
            <p className="text-white/40 text-xs mt-4">
              Collection is not currently available.
            </p>
          </div>

          <div className="space-y-4 fade-in-delay">
            <p className="text-white/30 font-mono text-xs">
              The ZK-Proof in this system does not allow for inconsistencies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/witness" className="btn-secondary">
                LEARN ABOUT ZK-PROOFS
              </Link>
              <Link href="/" className="btn-secondary">
                BACK TO MAIN
              </Link>
            </div>

            <div className="pt-4">
              <Link href="/burn" className="btn-danger">
                BURN INVALID ID
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
