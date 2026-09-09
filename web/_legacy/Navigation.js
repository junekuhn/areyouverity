'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectKitButton } from 'connectkit';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <nav className="border-b border-white/20 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-mono font-bold">
            Are You Verity?
          </Link>
          <div className="flex gap-6 text-sm font-mono">
            <Link
              href="/mint"
              className={`hover:text-white transition ${
                isActive('/mint') ? 'text-white' : 'text-white/60'
              }`}
            >
              Mint
            </Link>
            <Link
              href="/census"
              className={`hover:text-white transition ${
                isActive('/census') ? 'text-white' : 'text-white/60'
              }`}
            >
              Census
            </Link>
            <Link
              href="/arena"
              className={`hover:text-white transition ${
                isActive('/arena') ? 'text-white' : 'text-white/60'
              }`}
            >
              Arena
            </Link>
            <Link
              href="/leaderboard"
              className={`hover:text-white transition ${
                isActive('/leaderboard') ? 'text-white' : 'text-white/60'
              }`}
            >
              Leaderboard
            </Link>
            <Link
              href="/feed"
              className={`hover:text-white transition ${
                isActive('/feed') ? 'text-white' : 'text-white/60'
              }`}
            >
              Feed
            </Link>
          </div>
        </div>
        <ConnectKitButton />
      </div>
    </nav>
  );
}
