'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    }),
    coinbaseWallet({
      appName: 'TRANSEVIL',
    }),
  ],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          mode="light"
          theme="soft"
          options={{
            hideNoWalletCTA: true,
            hideQuestionMarkCTA: true,
            hideTooltips: true,
            walletConnectCTA: 'link',
            embedGoogleFonts: false,
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
