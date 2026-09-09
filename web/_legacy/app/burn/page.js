'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import WalletConnect from '../components/WalletConnect';
import { useContract } from '@/hooks/useContract';

export default function BurnPage() {
  const { isConnected } = useAccount();
  const { burn } = useContract();
  const [mounted, setMounted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [burning, setBurning] = useState(false);
  const [burned, setBurned] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleBurn = useCallback(async () => {
    if (!confirmed) return;
    setBurning(true);
    try {
      await burn(0); // TODO: pass actual token ID
      setBurned(true);
    } catch (err) {
      console.error('Burn failed:', err);
    } finally {
      setBurning(false);
    }
  }, [confirmed, burn]);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="fixed top-6 right-6 z-50">
        <WalletConnect />
      </div>
      <div className="fixed top-6 left-6 z-50">
        <Link href="/" className="text-white/30 font-mono text-xs tracking-widest hover:text-white/60 transition">
          BACK
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        {burned ? (
          <div className="max-w-md mx-auto text-center space-y-8 fade-in">
            <h1 className="text-4xl font-bold font-mono">Burned.</h1>
            <p className="text-white/50 font-mono text-sm">
              The token has been destroyed. This action is irreversible.
            </p>
            <Link href="/" className="btn-secondary inline-block">
              BACK TO MAIN
            </Link>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center space-y-8 fade-in">
            <div className="space-y-4">
              <p className="text-red-400/60 font-mono text-xs tracking-widest uppercase">
                Destructive Action
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold font-mono">
                Burn Token
              </h1>
            </div>

            <div className="terminal-box text-left">
              <p className="text-white/70">
                Are you sure? This action is irreversible. The token will be
                permanently destroyed and removed from the blockchain.
              </p>
            </div>

            {!confirmed ? (
              <div className="space-y-4">
                <button
                  onClick={() => setConfirmed(true)}
                  className="btn-danger"
                >
                  I UNDERSTAND, CONTINUE
                </button>
                <div>
                  <Link href="/" className="text-white/30 font-mono text-xs hover:text-white/60 transition">
                    Cancel
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {isConnected ? (
                  <button
                    onClick={handleBurn}
                    disabled={burning}
                    className="btn-danger"
                  >
                    {burning ? 'BURNING...' : 'BURN INVALID ID'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-white/40 font-mono text-sm">Connect wallet to burn</p>
                    <WalletConnect />
                  </div>
                )}
                <div>
                  <button
                    onClick={() => setConfirmed(false)}
                    className="text-white/30 font-mono text-xs hover:text-white/60 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
