'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WalletConnect from '../components/WalletConnect';
import TokenCard from '../components/TokenCard';

// Mock data for display until contract is live
const MOCK_TOKENS = [
  {
    tokenId: 1,
    image: '/images/base_2.png',
    invalidated: false,
    mintTimestamp: '2026-04-15T12:00:00Z',
    owner: '0x1234...5678',
  },
  {
    tokenId: 2,
    image: '/images/transevil.png',
    invalidated: true,
    mintTimestamp: '2026-04-16T14:30:00Z',
    owner: '0xabcd...ef01',
  },
  {
    tokenId: 3,
    image: '/images/base_2.png',
    invalidated: false,
    mintTimestamp: '2026-04-17T09:15:00Z',
    owner: '0x9876...5432',
  },
];

export default function CollectionPage() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'valid' | 'invalid'
  const [tokens, setTokens] = useState(MOCK_TOKENS);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const filtered = tokens.filter((t) => {
    if (filter === 'valid') return !t.invalidated;
    if (filter === 'invalid') return t.invalidated;
    return true;
  });

  const validCount = tokens.filter((t) => !t.invalidated).length;
  const invalidCount = tokens.filter((t) => t.invalidated).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed top-6 right-6 z-50">
        <WalletConnect />
      </div>
      <div className="fixed top-6 left-6 z-50">
        <Link href="/" className="text-white/30 font-mono text-xs tracking-widest hover:text-white/60 transition">
          BACK
        </Link>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-20 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold font-mono">
            Collection
          </h1>
          <p className="text-white/40 font-mono text-sm">
            All minted identity tokens
          </p>
          <p className="text-white/20 font-mono text-xs tracking-widest uppercase">
            Preview data &mdash; contract not yet connected
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 font-mono text-sm fade-in-delay">
          <div className="text-center">
            <p className="text-2xl font-bold">{tokens.length}</p>
            <p className="text-white/30 text-xs">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{validCount}</p>
            <p className="text-white/30 text-xs">Valid</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{invalidCount}</p>
            <p className="text-white/30 text-xs">Invalid</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 fade-in-delay">
          {['all', 'valid', 'invalid'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-xs tracking-wider px-4 py-2 border transition ${
                filter === f
                  ? 'border-white text-white'
                  : 'border-white/10 text-white/30 hover:text-white/60 hover:border-white/30'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 fade-in-delay-2">
            {filtered.map((token) => (
              <TokenCard key={token.tokenId} token={token} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-mono text-white/30 text-sm">
              No tokens found.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
