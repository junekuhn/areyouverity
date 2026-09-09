'use client';

import { ConnectKitButton } from 'connectkit';

export default function WalletConnect({ className = '' }) {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => (
        <button
          onClick={show}
          className={`whitespace-nowrap text-[0.68rem] tracking-[0.16em] uppercase transition-all duration-150 ${
            isConnected
              ? 'text-[color:var(--ink-60)] hover:text-[color:var(--ink)] border-b border-[color:var(--line)] hover:border-[color:var(--line-strong)] pb-0.5'
              : 'px-3 py-2 border border-[color:var(--line-strong)] hover:bg-[color:var(--ink)] hover:text-[color:var(--bg)]'
          } ${className}`}
        >
          {isConnected ? ensName || truncatedAddress : 'CONNECT WALLET'}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}
